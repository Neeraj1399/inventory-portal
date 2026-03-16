import Asset from "../models/Asset.js";
import AuditLog from "../models/AuditLog.js";

/**
 * @desc    Logic for assigning a serialized asset to an employee
 */
import mongoose from "mongoose";

export async function assignAssetToEmployee(assetId, employeeId, adminId) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const asset = await Asset.findById(assetId).session(session);

    if (!asset || asset.status !== "READY_TO_DEPLOY") {
      throw new Error("Asset unavailable or not found");
    }

    asset.status = "ALLOCATED";
    asset.allocatedTo = employeeId;
    asset.assignedAt = Date.now();
    await asset.save({ session });

    await AuditLog.create(
      [
        {
          action: "ALLOCATED",
          entityType: "Asset",
          entityId: asset._id,
          performedBy: adminId,
          targetEmployee: employeeId,
          description: `Allocated ${asset.assetName}`,
        },
      ],
      { session },
    );

    await session.commitTransaction();
    return asset;
  } catch (error) {
    await session.abortTransaction(); // Roll back changes if logging fails
    throw error;
  } finally {
    session.endSession();
  }
}
