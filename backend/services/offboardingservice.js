import mongoose from "mongoose";
import Employee from "../models/Employee.js";
import Asset from "../models/Asset.js";
import Consumable from "../models/Consumable.js"; // <--- Add this
import AuditLog from "../models/AuditLog.js";
import AppError from "../utils/appError.js";
export async function processFullOffboard(employeeId, adminId) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Initial Validation
    const employee = await Employee.findById(employeeId).session(session);
    if (!employee) throw new AppError("Employee not found", 404);
    if (employee.status === "OFFBOARDED") {
      throw new AppError("Employee is already offboarded", 400);
    }

    // 2. THE CHECK: Block if assets are still assigned
    // We search for any asset where the status is "ASSIGNED" to this person
    const activeAssetsCount = await Asset.countDocuments({
      assignedTo: employeeId,
      status: "ASSIGNED",
    }).session(session);

    if (activeAssetsCount > 0) {
      // We throw a 400 error which the frontend alert will catch
      throw new AppError(
        `Offboarding blocked: This employee still has ${activeAssetsCount} hardware asset(s) assigned. Please return gear to inventory before offboarding.`,
        400,
      );
    }

    // 3. CLEAR CONSUMABLES (Atomic Logic)
    // Consumables (like pens/notebooks) are usually not returned, so we just clear the records
    const consumables = await Consumable.find({
      "assignments.employeeId": employeeId,
    }).session(session);

    for (const item of consumables) {
      const assignment = item.assignments.find(
        (a) => a.employeeId.toString() === employeeId.toString(),
      );

      if (assignment) {
        await Consumable.updateOne(
          { _id: item._id },
          {
            $inc: { assignedQuantity: -assignment.quantity },
            $pull: { assignments: { employeeId: employeeId } },
          },
          { session },
        );
      }
    }

    // 4. FINALIZE EMPLOYEE & LOG ACTION
   employee.status = "OFFBOARDED";
    
    // --- NEW AUDIT LOGIC START ---
    // Release the email for future hires by appending a unique suffix.
    // Example: "john@company.com" becomes "john@company.com_OFF_1741512000"
    const timestamp = Math.floor(Date.now() / 1000);
    employee.email = `${employee.email}_OFF_${timestamp}`;
    // --- NEW AUDIT LOGIC END ---

    await employee.save({ session });

    await AuditLog.create(
      [
        {
          action: "OFFBOARDED",
          entityType: "Employee",
          entityId: employee._id,
          performedBy: adminId,
          description: `Employee ${employee.name} offboarded. Email archived to allow reuse.`,
        },
      ],
      { session },
    );

    // Commit all changes
    await session.commitTransaction();

    return {
      message: "Offboarding completed successfully",
      consumablesCleared: consumables.length,
    };
  } catch (error) {
    // If ANY step fails (or the asset check triggers), roll back everything
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
