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

    // 3. Log it (Using modified field names for consistency)
    if (req.user && req.user._id) {
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
      action: "MODIFIED",
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
// export async function returnConsumable(req, res, next) {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { employeeId, quantity, returnStatus } = req.body; // Added returnStatus
//     const qty = Number(quantity);

//     if (qty <= 0)
//       return next(new AppError("Return quantity must be greater than 0", 400));

//     // 1. Find the consumable and ensure the employee actually has it
//     const item = await Consumable.findOne({
//       _id: req.params.id,
//       "assignments.employeeId": new mongoose.Types.ObjectId(employeeId),
//     }).session(session);
//     // const item = await Consumable.findOne({
//     //   _id: req.params.id,
//     //   "assignments.employeeId": employeeId,
//     // }).session(session);

//     if (!item) throw new AppError("No assignment found for this employee", 404);

//     const assignment = item.assignments.find(
//       // (a) => a.employeeId.toString() === employeeId,
//       (a) => a.employeeId._id.toString() === employeeId,
//     );

//     if (assignment.quantity < qty) {
//       throw new AppError("Return quantity exceeds allocated quantity", 400);
//     }

//     // 2. Determine Inventory Impact
//     // If it's for Repair or Scrapped, it's no longer part of "Total" usable stock.
//     const updateFields = { $inc: { assignedQuantity: -qty } };

//     if (returnStatus === "UNDER_MAINTENANCE" || returnStatus === "DECOMMISSIONED") {
//       updateFields.$inc.totalQuantity = -qty;
//     }

//     // 3. Update the document
//     if (assignment.quantity === qty) {
//       // Remove assignment entirely if returning everything
//       await Consumable.findByIdAndUpdate(
//         req.params.id,
//         {
//           ...updateFields,
//           $pull: { assignments: { employeeId } },
//         },
//         { session },
//       );
//     } else {
//       // Decrease the quantity in the assignment array
//       await Consumable.updateOne(
//         { _id: req.params.id, "assignments.employeeId": employeeId },
//         {
//           ...updateFields,
//           $inc: { ...updateFields.$inc, "assignments.$.quantity": -qty },
//         },
//         { session },
//       );
//     }

//     // 4. Detailed Audit Log
//     const statusText =
//       returnStatus === "READY_TO_DEPLOY" ? "to STOCK" : `as ${returnStatus}`;

//     await AuditLog.create(
//       [
//         {
//           action: "RECOVERED",
//           entityType: "Consumable",
//           entityId: item._id,
//           performedBy: req.user._id,
//           targetEmployee: employeeId,
//           description: `Returned ${qty} unit(s) of ${item.itemName} ${statusText}.`,
//         },
//       ],
//       { session },
//     );

//     await session.commitTransaction();
//     res
//       .status(200)
//       .json({ status: "success", message: "Item processed successfully" });
//   } catch (err) {
//     await session.abortTransaction();
//     next(err);
//   } finally {
//     session.endSession();
//   }
// }
export async function returnConsumable(req, res, next) {
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
    // We always decrement assignedQuantity. 
    // We only decrement totalQuantity if DECOMMISSIONED.
    // We increment maintenanceQuantity if UNDER_MAINTENANCE.
    const incFields = { assignedQuantity: -qty };

    if (returnStatus === "DECOMMISSIONED") {
      incFields.totalQuantity = -qty;
    } else if (returnStatus === "UNDER_MAINTENANCE") {
      incFields.maintenanceQuantity = qty;
    }

    // 3. Atomic Update to prevent property overwriting
    const isReturningAll = assignment.quantity === qty;
    
    const updatePayload = { $inc: incFields };
    if (isReturningAll) {
      updatePayload.$pull = { assignments: { employeeId } };
    } else {
      // Use the positional operator to update the specific assignment
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
    next(err);
  } finally {
    session.endSession();
  }
}
/**
 * @desc    Delete/Scrap a consumable item permanently
 * @route   DELETE /api/consumables/:id
 * @access  Private/Admin
 */
export const deleteConsumable = async (req, res) => {
  try {
    const consumable = await Consumable.findById(req.params.id);

    if (!consumable) {
      return res.status(404).json({
        status: "fail",
        message: "Consumable not found",
      });
    }

    // Optional: Prevent deletion if items are still allocated to employees
    if (consumable.assignedQuantity > 0) {
      return res.status(400).json({
        status: "fail",
        message:
          "Cannot delete item while units are still allocated to employees. Return them first.",
      });
    }

    // 1. Store name before deletion for the log description
    const deletedItemName = consumable.itemName;

    // 2. Delete the item
    await consumable.deleteOne();

    // 3. 🔴 THE FIX: Create the Audit Log entry
    if (req.user && req.user._id) {
      await AuditLog.create({
        action: "DELETED",
        entityType: "Consumable",
        entityId: req.params.id, // The ID of the item that was just removed
        performedBy: req.user._id,
        description: `Permanently deleted "${deletedItemName}" from the inventory.`,
      });
    }

    // Note: 204 status does not send a body, so the "data: null" is symbolic
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
/**
 * @desc    Adjust consumable stock for Maintenance or Scrap
 * @route   PATCH /api/consumables/:id/condition
 * @access  Admin
 */
// export async function updateCondition(req, res, next) {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { actionType, quantity, reason } = req.body;
//     const qty = Number(quantity);

//     if (qty <= 0) {
//       return next(
//         new AppError("Adjustment quantity must be greater than 0", 400),
//       );
//     }

//     // 1. Find the item
//     const item = await Consumable.findById(req.params.id).session(session);
//     if (!item) {
//       throw new AppError("Consumable not found", 404);
//     }

//     // 2. Calculate current available stock
//     const available = item.totalQuantity - item.assignedQuantity;
//     if (qty > available) {
//       throw new AppError(
//         `Insufficient stock. Only ${available} units available in warehouse.`,
//         400,
//       );
//     }

//     // 3. Apply Logic based on Action Type
//     let description = "";

//     if (actionType === "SCRAP") {
//       // Permanent removal: Reduce total quantity
//       item.totalQuantity -= qty;
//       description = `Scrapped ${qty} units of ${item.itemName}. Reason: ${reason || "Not specified"}`;
//     } else {
//       // Maintenance: Typically we just sideline them.
//       // If your schema doesn't have a 'maintenanceQuantity' field,
//       // we reduce totalQuantity so they aren't "available" for assignment.
//       item.totalQuantity -= qty;
//       description = `Moved ${qty} units of ${item.itemName} to MAINTENANCE. Reason: ${reason || "Not specified"}`;
//     }

//     await item.save({ session });

//     // 4. Create Audit Log
//     if (req.user && req.user._id) {
//       await AuditLog.create(
//         [
//           {
//             action: actionType === "SCRAP" ? "DELETED" : "MODIFIED",
//             entityType: "Consumable",
//             entityId: item._id,
//             performedBy: req.user._id,
//             description: description,
//           },
//         ],
//         { session },
//       );
//     }

//     await session.commitTransaction();
//     res.status(200).json({
//       status: "success",
//       message: "Condition modified successfully",
//       data: item,
//     });
//   } catch (err) {
//     await session.abortTransaction();
//     next(err);
//   } finally {
//     session.endSession();
//   }
// }
export async function updateCondition(req, res, next) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { actionType, quantity, reason } = req.body;
    const qty = Number(quantity);

    if (qty <= 0)
      return next(new AppError("Quantity must be greater than 0", 400));

    const item = await Consumable.findById(req.params.id).session(session);
    if (!item) throw new AppError("Consumable not found", 404);

    // Calculate warehouse availability (Total - Allocated - already in Maintenance)
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
      // Permanent removal from physical inventory
      item.totalQuantity -= qty;
      description = `Scrapped ${qty} units of ${item.itemName}. Reason: ${reason}`;
    } else {
      // ✅ FIX: Don't reduce totalQuantity. Move to maintenanceQuantity instead.
      item.maintenanceQuantity = (item.maintenanceQuantity || 0) + qty;
      description = `Moved ${qty} units of ${item.itemName} to UNDER_MAINTENANCE. Reason: ${reason}`;
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
    next(err);
  } finally {
    session.endSession();
  }
}
/**
 * @desc    Return items from Maintenance to Stock OR Scrap them
 * @route   PATCH /api/consumables/:id/resolve-maintenance
 */
export async function resolveMaintenance(req, res, next) {
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
      // Move from maintenance pool back to available pool
      item.maintenanceQuantity -= qty;
    } else if (action === "SCRAP") {
      // Permanently remove from both maintenance and total count
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
            description: `${action === "RETURN" ? "Restored" : "Scrapped"} ${qty} units from maintenance for ${item.itemName}.`,
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
