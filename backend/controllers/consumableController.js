import Consumable from "../models/Consumable.js";
import AuditLog from "../models/AuditLog.js";
import AppError from "../utils/appError.js";
import mongoose from "mongoose";

/**
 * @desc    Get all consumables
 * @route   GET /api/consumables
 * @access  Private
 */
export async function getConsumables(req, res, next) {
  try {
    const items = await Consumable.find()
      .populate("assignments.employeeId", "name email")
      .lean();
    res
      .status(200)
      .json({ status: "success", results: items.length, data: items });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Get single consumable by ID
 * @route   GET /api/consumables/:id
 * @access  Private
 */
export async function getConsumableById(req, res, next) {
  try {
    const item = await Consumable.findById(req.params.id)
      .populate("assignments.employeeId", "name email")
      .lean();
    if (!item) return next(new AppError("Consumable not found", 404));

    res.status(200).json({ status: "success", data: item });
  } catch (err) {
    next(err);
  }
}
/**
 * @desc    Create new consumable type
 * @route   POST /api/consumables
 * @access  Admin
 */
// export async function createConsumable(req, res, next) {
//   try {
//     // 1. Map frontend 'quantity' to backend 'totalQuantity' if needed
//     const consumableData = {
//       ...req.body,
//       totalQuantity: req.body.totalQuantity || req.body.quantity || 0,
//     };

//     const newItem = await Consumable.create(consumableData);

//     // 2. SAFETY CHECK: Only create AuditLog if user is authenticated
//     if (req.user && req.user._id) {
//       await AuditLog.create({
//         action: "CREATED",
//         entityType: "Consumable",
//         entityId: newItem._id,
//         performedBy: req.user._id,
//         description: `Added ${newItem.itemName} to inventory.`,
//       });
//     } else {
//       console.warn("⚠️ Item created, but AuditLog skipped: No req.user found.");
//     }

//     res.status(201).json({ status: "success", data: newItem });
//   } catch (err) {
//     // This will now catch Duplicate Key errors (if index still exists)
//     // or Validation errors (if fields are missing)
//     next(err);
//   }
//}
export async function createConsumable(req, res, next) {
  try {
    // 1. Create the item
    const newItem = await Consumable.create({
      ...req.body,
      totalQuantity: Number(req.body.totalQuantity),
      lowStockThreshold: Number(req.body.lowStockThreshold),
    });

    // 2. Safety check for AuditLog to prevent crashing if req.user is missing
    if (req.user && req.user._id) {
      await AuditLog.create({
        action: "CREATED",
        entityType: "Consumable",
        entityId: newItem._id,
        performedBy: req.user._id,
        description: `Added ${newItem.itemName} to inventory.`,
      });
    }

    res.status(201).json({ status: "success", data: newItem });
  } catch (err) {
    // If this fails, 'next' must be a valid function from the route
    next(err);
  }
}
/**
 * @desc    Assign consumable to employee
 * @route   POST /api/consumables/:id/assign
 * @access  Admin
 */
export async function assignConsumable(req, res, next) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { employeeId, quantity } = req.body;
    const qty = Number(quantity);

    if (qty <= 0)
      return next(new AppError("Quantity must be greater than 0", 400));

    // 1. ATOMIC UPDATE
    // Updates ONLY if stock is sufficient to prevent race conditions
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

    // 3. Log it (Using updated field names for consistency)
    if (req.user && req.user._id) {
      await AuditLog.create(
        [
          {
            action: "ASSIGNED",
            entityType: "Consumable",
            entityId: item._id,
            performedBy: req.user._id,
            targetEmployee: employeeId,
            description: `Issued ${qty} units of ${item.itemName}.`,
          },
        ],
        { session },
      );
    }

    await session.commitTransaction();
    res.status(200).json({ status: "success", data: item });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
}

/**
 * @desc    Add stock to existing consumable
 * @route   PATCH /api/consumables/:id/restock
 * @access  Admin
 */
export async function restockConsumable(req, res, next) {
  try {
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
      action: "UPDATED",
      entityType: "Consumable",
      entityId: item._id,
      performedBy: req.user._id,
      description: `Restocked ${qty} units for ${item.itemName}.`,
    });

    res.status(200).json({ status: "success", data: item });
  } catch (err) {
    next(err);
  }
}
/**
 * @desc    Return a consumable item from an employee
 * @route   POST /api/consumables/:id/return
 */
export async function returnConsumable(req, res, next) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { employeeId, quantity, returnStatus } = req.body; // Added returnStatus
    const qty = Number(quantity);

    if (qty <= 0)
      return next(new AppError("Return quantity must be greater than 0", 400));

    // 1. Find the consumable and ensure the employee actually has it
    const item = await Consumable.findOne({
      _id: req.params.id,
      "assignments.employeeId": new mongoose.Types.ObjectId(employeeId),
    }).session(session);
    // const item = await Consumable.findOne({
    //   _id: req.params.id,
    //   "assignments.employeeId": employeeId,
    // }).session(session);

    if (!item) throw new AppError("No assignment found for this employee", 404);

    const assignment = item.assignments.find(
      // (a) => a.employeeId.toString() === employeeId,
      (a) => a.employeeId._id.toString() === employeeId,
    );

    if (assignment.quantity < qty) {
      throw new AppError("Return quantity exceeds assigned quantity", 400);
    }

    // 2. Determine Inventory Impact
    // If it's for Repair or Scrapped, it's no longer part of "Total" usable stock.
    const updateFields = { $inc: { assignedQuantity: -qty } };

    if (returnStatus === "REPAIR" || returnStatus === "SCRAPPED") {
      updateFields.$inc.totalQuantity = -qty;
    }

    // 3. Update the document
    if (assignment.quantity === qty) {
      // Remove assignment entirely if returning everything
      await Consumable.findByIdAndUpdate(
        req.params.id,
        {
          ...updateFields,
          $pull: { assignments: { employeeId } },
        },
        { session },
      );
    } else {
      // Decrease the quantity in the assignment array
      await Consumable.updateOne(
        { _id: req.params.id, "assignments.employeeId": employeeId },
        {
          ...updateFields,
          $inc: { ...updateFields.$inc, "assignments.$.quantity": -qty },
        },
        { session },
      );
    }

    // 4. Detailed Audit Log
    const statusText =
      returnStatus === "AVAILABLE" ? "to STOCK" : `as ${returnStatus}`;

    await AuditLog.create(
      [
        {
          action: "RETURNED",
          entityType: "Consumable",
          entityId: item._id,
          performedBy: req.user._id,
          targetEmployee: employeeId,
          description: `Returned ${qty} unit(s) of ${item.itemName} ${statusText}.`,
        },
      ],
      { session },
    );

    await session.commitTransaction();
    res
      .status(200)
      .json({ status: "success", message: "Item processed successfully" });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
}
