import Consumable from "../models/Consumable.js";
import AuditLog from "../models/AuditLog.js";
import AppError from "../utils/appError.js";
import mongoose from "mongoose";
import catchAsync from "../utils/catchAsync.js";

/**
 * @desc    Get all consumables
 * @route   GET /api/consumables
 * @access  Private
 */
export const getConsumables = catchAsync(async (req, res, next) => {
  const { search, status } = req.query;

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 50));
  const skip = (page - 1) * limit;

  let filter = {};

  if (search?.trim()) {
    filter.$or = [
      { itemName: { $regex: search.trim(), $options: "i" } },
      { category: { $regex: search.trim(), $options: "i" } },
    ];
  }

  if (status && status !== "ALL") {
    switch (status) {
      case "LOW STOCK":
        filter.$expr = {
          $lte: [
            { $subtract: ["$totalQuantity", { $add: ["$assignedQuantity", { $ifNull: ["$maintenanceQuantity", 0] }] }] },
            { $ifNull: ["$lowStockThreshold", 5] }
          ]
        };
        break;
      case "READY_TO_DEPLOY":
        filter.$expr = {
          $gt: [
            { $subtract: ["$totalQuantity", { $add: ["$assignedQuantity", { $ifNull: ["$maintenanceQuantity", 0] }] }] },
            0
          ]
        };
        break;
      case "ALLOCATED":
        filter.assignedQuantity = { $gt: 0 };
        break;
      case "UNDER_MAINTENANCE":
        filter.maintenanceQuantity = { $gt: 0 };
        break;
      case "RESTOCK":
        filter.$expr = {
          $lte: [
            { $subtract: ["$totalQuantity", { $add: ["$assignedQuantity", { $ifNull: ["$maintenanceQuantity", 0] }] }] },
            { $ifNull: ["$lowStockThreshold", 5] }
          ]
        };
        break;
      default:
        // Assume direct status match if any other string is passed
        break;
    }
  }

  const [items, total] = await Promise.all([
    Consumable.find(filter)
      .populate("assignments.employeeId", "name email")
      .sort("-createdAt")
      .skip(skip)
      .limit(limit)
      .lean(),
    Consumable.countDocuments(filter),
  ]);

  res.status(200).json({
    status: "success",
    results: items.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
    data: items,
  });
});

/**
 * @desc    Get single consumable by ID
 * @route   GET /api/consumables/:id
 * @access  Private
 */
export const getConsumableById = catchAsync(async (req, res, next) => {
  const item = await Consumable.findById(req.params.id)
    .populate("assignments.employeeId", "name email")
    .lean();
  if (!item) return next(new AppError("Consumable not found", 404));

  res.status(200).json({ status: "success", data: item });
});
/**
 * @desc    Create new consumable type
 * @route   POST /api/consumables
 * @access  Admin
 */

export const createConsumable = catchAsync(async (req, res, next) => {
  // 1. Create the item
  const newItem = await Consumable.create({
    ...req.body,
    totalQuantity: Number(req.body.totalQuantity),
    lowStockThreshold: Number(req.body.lowStockThreshold),
  });

  // 2. Safety check for AuditLog
  if (req.user?._id) {
    await AuditLog.create({
      action: "CREATED",
      entityType: "Consumable",
      entityId: newItem._id,
      performedBy: req.user._id,
      description: `Added ${newItem.itemName} to inventory.`,
    });
  }

  res.status(201).json({ status: "success", data: newItem });
});
/**
 * @desc    Assign consumable to employee
 * @route   POST /api/consumables/:id/assign
 * @access  Admin
 */
export const assignConsumable = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { employeeId, quantity } = req.body;
    const qty = Number(quantity);

    if (qty <= 0)
      return next(new AppError("Quantity must be greater than 0", 400));

    // 1. ATOMIC UPDATE
    const item = await Consumable.findOneAndUpdate(
      {
        _id: req.params.id,
        $expr: {
          $gte: [{ $subtract: ["$totalQuantity", "$assignedQuantity"] }, qty],
        },
      },
      {
        $inc: { assignedQuantity: qty },
      },
      { new: true, session },
    );

    if (!item) {
      throw new AppError("Consumable not found or insufficient stock", 400);
    }

    // 2. Update the assignments array
    const existingAssignment = await Consumable.findOneAndUpdate(
      { _id: item._id, "assignments.employeeId": employeeId },
      { $inc: { "assignments.$.quantity": qty } },
      { session, new: true },
    );

    if (!existingAssignment) {
      await Consumable.findByIdAndUpdate(
        item._id,
        { $push: { assignments: { employeeId, quantity: qty } } },
        { session },
      );
    }

    // 3. Log it
    if (req.user?._id) {
      await AuditLog.create(
        [
          {
            action: "ALLOCATED",
            entityType: "Consumable",
            entityId: item._id,
            performedBy: req.user._id,
            targetEmployee: employeeId,
            description: `Handed over ${qty} units of ${item.itemName}.`,
          },
        ],
        { session },
      );
    }

    await session.commitTransaction();
    res.status(200).json({ status: "success", data: item });
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
});

/**
 * @desc    Add stock to existing consumable
 * @route   PATCH /api/consumables/:id/restock
 * @access  Admin
 */
export const restockConsumable = catchAsync(async (req, res, next) => {
  const { quantity } = req.body;
  const qty = Number(quantity);

  if (qty <= 0)
    return next(new AppError("Restock amount must be positive", 400));

  const item = await Consumable.findByIdAndUpdate(
    req.params.id,
    { $inc: { totalQuantity: qty } },
    { new: true, runValidators: true },
  );

  if (!item) return next(new AppError("Consumable not found", 404));

  await AuditLog.create({
    action: "REPLENISHED",
    entityType: "Consumable",
    entityId: item._id,
    performedBy: req.user._id,
    description: `Restocked ${qty} units for ${item.itemName}.`,
  });

  res.status(200).json({ status: "success", data: item });
});
/**
 * @desc    Return a consumable item from an employee
 * @route   POST /api/consumables/:id/return
 */
export const returnConsumable = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { employeeId, quantity, returnStatus } = req.body;
    const qty = Number(quantity);

    if (qty <= 0) return next(new AppError("Return quantity must be greater than 0", 400));

    // 1. Verify assignment exists
    const item = await Consumable.findOne({
      _id: req.params.id,
      "assignments.employeeId": new mongoose.Types.ObjectId(employeeId),
    }).session(session);

    if (!item) throw new AppError("No assignment found for this employee", 404);

    const assignment = item.assignments.find(
      (a) => a.employeeId.toString() === employeeId
    );

    if (assignment.quantity < qty) {
      throw new AppError("Return quantity exceeds allocated quantity", 400);
    }

    // 2. Consistent Inventory Impact Logic
    const incFields = { assignedQuantity: -qty };

    if (returnStatus === "DECOMMISSIONED") {
      incFields.totalQuantity = -qty;
    } else if (returnStatus === "UNDER_MAINTENANCE") {
      incFields.maintenanceQuantity = qty;
    }

    // 3. Atomic Update
    const isReturningAll = assignment.quantity === qty;
    
    const updatePayload = { $inc: incFields };
    if (isReturningAll) {
      updatePayload.$pull = { assignments: { employeeId } };
    } else {
      updatePayload.$inc["assignments.$.quantity"] = -qty;
    }

    const updatedItem = await Consumable.findOneAndUpdate(
      { 
        _id: req.params.id, 
        ...(isReturningAll ? {} : { "assignments.employeeId": employeeId }) 
      },
      updatePayload,
      { session, new: true }
    );

    // 4. Audit Logging
    const statusText = returnStatus === "READY_TO_DEPLOY" ? "to STOCK" : `as ${returnStatus}`;
    if (req.user?._id) {
      await AuditLog.create([{
        action: "RECOVERED",
        entityType: "Consumable",
        entityId: item._id,
        performedBy: req.user._id,
        targetEmployee: employeeId,
        description: `Returned ${qty} unit(s) of ${item.itemName} ${statusText}.`,
      }], { session });
    }

    await session.commitTransaction();
    res.status(200).json({ status: "success", data: updatedItem });
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
});
/**
 * @desc    Delete/Scrap a consumable item permanently
 * @route   DELETE /api/consumables/:id
 * @access  Private/Admin
 */
export const deleteConsumable = catchAsync(async (req, res, next) => {
  const consumable = await Consumable.findById(req.params.id);

  if (!consumable) {
    return next(new AppError("Consumable not found", 404));
  }

  // Prevent deletion if items are still allocated to employees
  if (consumable.assignedQuantity > 0) {
    return next(
      new AppError(
        "Cannot delete item while units are still allocated to employees. Return them first.",
        400,
      ),
    );
  }

  const deletedItemName = consumable.itemName;
  await consumable.deleteOne();

  if (req.user?._id) {
    await AuditLog.create({
      action: "DELETED",
      entityType: "Consumable",
      entityId: req.params.id,
      performedBy: req.user._id,
      description: `Permanently deleted "${deletedItemName}" from the inventory.`,
    });
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
/**
 * @desc    Adjust consumable stock for Maintenance or Scrap
 * @route   PATCH /api/consumables/:id/condition
 * @access  Admin
 */
export const updateCondition = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { actionType, quantity, reason } = req.body;
    const qty = Number(quantity);

    if (qty <= 0)
      return next(new AppError("Quantity must be greater than 0", 400));

    const item = await Consumable.findById(req.params.id).session(session);
    if (!item) throw new AppError("Consumable not found", 404);

    const available =
      item.totalQuantity -
      item.assignedQuantity -
      (item.maintenanceQuantity || 0);

    if (qty > available) {
      throw new AppError(
        `Insufficient stock. Only ${available} available.`,
        400,
      );
    }

    let description = "";

    if (actionType === "SCRAP") {
      item.totalQuantity -= qty;
      description = `Scrapped ${qty} units of ${item.itemName}`;
    } else {
      item.maintenanceQuantity = (item.maintenanceQuantity || 0) + qty;
      description = `Moved ${qty} units of ${item.itemName} to MAINTENANCE`;
    }

    await item.save({ session });

    if (req.user?._id) {
      await AuditLog.create(
        [
          {
            action: actionType === "SCRAP" ? "DELETED" : "MODIFIED",
            entityType: "Consumable",
            entityId: item._id,
            performedBy: req.user._id,
            description: description,
          },
        ],
        { session },
      );
    }

    await session.commitTransaction();
    res.status(200).json({ status: "success", data: item });
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
});
/**
 * @desc    Return items from Maintenance to Stock OR Scrap them
 * @route   PATCH /api/consumables/:id/resolve-maintenance
 */
export const resolveMaintenance = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { action, quantity } = req.body; // action: 'RETURN' or 'SCRAP'
    const qty = Number(quantity);

    const item = await Consumable.findById(req.params.id).session(session);
    if (!item) throw new AppError("Consumable not found", 404);

    if (qty > (item.maintenanceQuantity || 0)) {
      throw new AppError(
        "Quantity exceeds items currently in maintenance",
        400,
      );
    }

    if (action === "RETURN") {
      item.maintenanceQuantity -= qty;
    } else if (action === "SCRAP") {
      item.maintenanceQuantity -= qty;
      item.totalQuantity -= qty;
    }

    await item.save({ session });

    if (req.user?._id) {
      await AuditLog.create(
        [
          {
            action: action === "RETURN" ? "MODIFIED" : "DELETED",
            entityType: "Consumable",
            entityId: item._id,
            performedBy: req.user._id,
            description: `${action === "RETURN" ? "Restored" : "Scrapped"} ${qty} units from maintenance for ${item.itemName}`,
          },
        ],
        { session },
      );
    }

    await session.commitTransaction();
    res.status(200).json({ status: "success", data: item });
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
});
