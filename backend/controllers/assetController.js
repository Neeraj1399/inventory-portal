import Employee from "../models/Employee.js";
import Asset from "../models/Asset.js";
import AuditLog from "../models/AuditLog.js";
import AppError from "../utils/appError.js";
import cloudinary, { uploadFromBuffer } from "../utils/cloudinary.js";
import fs from "fs";
import mongoose from "mongoose";
import catchAsync from "../utils/catchAsync.js";

// --- 1. RETRIEVAL CONTROLLERS ---

export const getAssets = catchAsync(async (req, res, next) => {
  const { search, status, category, allocatedTo } = req.query;

  // Pagination defaults (page=1, limit=50 — adjustable by frontend)
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 50));
  const skip = (page - 1) * limit;

  let filter = {};

  if (req.user.roleAccess === "STAFF") {
    filter.allocatedTo = req.user._id;
  } else {
    if (allocatedTo) filter.allocatedTo = allocatedTo;

    if (search?.trim()) {
      filter.$or = [
        { model: { $regex: search.trim(), $options: "i" } },
        { serialNumber: { $regex: search.trim(), $options: "i" } },
      ];
    }

    if (status && status !== "ALL") filter.status = status;

    if (category?.trim()) {
      filter.category = { $regex: category.trim(), $options: "i" };
    }
  }

  // Execute query + count in parallel to minimize total wait time
  const [assets, total] = await Promise.all([
    Asset.find(filter)
      .populate({ path: "allocatedTo", select: "name email" })
      .sort("-createdAt")
      .skip(skip)
      .limit(limit)
      .lean(),
    Asset.countDocuments(filter),
  ]);

  res.status(200).json({
    status: "success",
    results: assets.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
    data: assets,
  });
});

/**
 * @desc    Get all unique asset categories
 * @route   GET /api/assets/categories
 * @access  Private
 */
export const getCategories = catchAsync(async (req, res, next) => {
  const categories = await Asset.distinct("category");
  res.status(200).json({
    status: "success",
    data: categories,
  });
});

export const getAsset = catchAsync(async (req, res, next) => {
  const asset = await Asset.findById(req.params.id)
    .populate({
      path: "allocatedTo",
      select: "name email department",
    })
    .lean();
  if (!asset) return next(new AppError("No asset found with that ID", 404));
  res.status(200).json({ status: "success", data: asset });
});

// --- 2. CREATION & UPDATE CONTROLLERS ---

export const createAsset = catchAsync(async (req, res, next) => {
  // Asset Classification is now just a string from req.body
  const {
    category,
    model,
    serialNumber,
    purchasePrice,
    purchaseDate,
    warrantyMonths,
  } = req.body;

  let receiptUrl = "";

  if (req.file) {
    const result = await uploadFromBuffer(req.file.buffer, {
      folder: "assets/receipts",
      public_id: `receipt_${serialNumber}_${Date.now()}`,
    });
    receiptUrl = result.secure_url;
  }

  const newAsset = await Asset.create({
    category, // Passed directly as string
    model,
    serialNumber,
    purchasePrice: Number(purchasePrice) || 0,
    purchaseDate,
    warrantyMonths: Number(warrantyMonths) || 12,
    receiptUrl,
  });

  await AuditLog.create({
    action: "CREATED",
    entityType: "Asset",
    entityId: newAsset._id,
    performedBy: req.user._id,
    description: `Added new asset: ${newAsset.model} (SN: ${newAsset.serialNumber})`,
  });

  res.status(201).json({ status: "success", data: newAsset });
});

export const updateAsset = catchAsync(async (req, res, next) => {
  const asset = await Asset.findById(req.params.id);
  if (!asset) {
    return next(new AppError("Asset not found", 404));
  }

  const updateData = { ...req.body };

  if (updateData.purchasePrice)
    updateData.purchasePrice = Number(updateData.purchasePrice);
  if (updateData.warrantyMonths)
    updateData.warrantyMonths = Number(updateData.warrantyMonths);

  if (req.file) {
    const result = await uploadFromBuffer(req.file.buffer, {
      folder: "assets/receipts",
      public_id: `receipt_${updateData.serialNumber || asset.serialNumber}_${Date.now()}`,
    });
    updateData.receiptUrl = result.secure_url;
  }

  const updatedAsset = await Asset.findByIdAndUpdate(
    req.params.id,
    { $set: updateData },
    { new: true, runValidators: true },
  );

  // If status was changed specifically, use it as the action for better filtering
  const auditAction = (updateData.status && updateData.status !== asset.status) 
    ? updateData.status 
    : "MODIFIED";

  await AuditLog.create({
    action: auditAction,
    entityType: "Asset",
    entityId: asset._id,
    performedBy: req.user._id,
    description: auditAction === "MODIFIED" 
      ? `Modified details for ${updatedAsset.model}.`
      : `Asset ${updatedAsset.model} status changed to ${auditAction}.`,
  });

  res.status(200).json({ status: "success", data: updatedAsset });
});

/**
 * @desc    Specifically update only the receipt
 * @route   PATCH /api/assets/:id/receipt
 */
export const uploadAssetReceipt = catchAsync(async (req, res, next) => {
  if (!req.file)
    return next(new AppError("Please provide a receipt file.", 400));

  const asset = await Asset.findById(req.params.id);
  if (!asset) {
    return next(new AppError("Asset not found.", 404));
  }

  const result = await uploadFromBuffer(req.file.buffer, {
    folder: "assets/receipts",
    public_id: `receipt_${asset.serialNumber}_${Date.now()}`,
  });

  asset.receiptUrl = result.secure_url;
  await asset.save();

  res
    .status(200)
    .json({ status: "success", data: { receiptUrl: asset.receiptUrl } });
});

// --- 3. LIFECYCLE (ASSIGN/RETURN/UNDER_MAINTENANCE) CONTROLLERS ---

/**
 * @desc    Assign asset to employee
 */
export const assignAsset = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { employeeId } = req.body;

    const employee = await Employee.findOne({ _id: employeeId, status: "ACTIVE" }).session(session);
    if (!employee) throw new AppError("Employee not found or is not active", 400);

    const existingAsset = await Asset.findById(req.params.id).session(session);
    if (!existingAsset) throw new AppError("Asset not found", 404);
    if (
      existingAsset.status === "ALLOCATED" &&
      existingAsset.allocatedTo?.toString() === employeeId
    ) {
      await session.commitTransaction();
      return res.status(200).json({ status: "success", data: existingAsset });
    }

    const asset = await Asset.findOneAndUpdate(
      { _id: req.params.id, status: "READY_TO_DEPLOY" },
      { $set: { status: "ALLOCATED", allocatedTo: employeeId } },
      { new: true, session },
    );

    if (!asset) throw new AppError("Asset is no longer available", 400);

    await Employee.findByIdAndUpdate(
      employeeId,
      { $inc: { assignedAssetsCount: 1 } },
      { session },
    );

    await AuditLog.create(
      [
        {
          action: "ALLOCATED",
          entityType: "Asset",
          entityId: asset._id,
          performedBy: req.user._id,
          targetEmployee: employeeId,
          description: `Allocated ${asset.model} (SN: ${asset.serialNumber}) to employee.`,
        },
      ],
      { session },
    );

    await session.commitTransaction();
    res.status(200).json({ status: "success", data: asset });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
});

/**
 * @desc    Return asset to inventory
 */
export const returnAsset = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const VALID_RETURN_STATUSES = ["READY_TO_DEPLOY", "UNDER_MAINTENANCE", "DECOMMISSIONED", "BROKEN"];
    const returnStatus = req.body?.returnStatus || "READY_TO_DEPLOY";
    if (!VALID_RETURN_STATUSES.includes(returnStatus)) {
      await session.abortTransaction();
      return next(new AppError(`Invalid return status: ${returnStatus}`, 400));
    }

    const asset = await Asset.findById(req.params.id).session(session);

    if (!asset) throw new AppError("Asset not found", 404);
    if (asset.status !== "ALLOCATED") {
      await session.commitTransaction();
      return res.status(200).json({
        status: "success",
        message: "Asset already returned.",
        data: asset,
      });
    }

    const previousHolder = asset.allocatedTo;
    asset.status = returnStatus;
    asset.allocatedTo = null;
    await asset.save({ session });

    if (previousHolder) {
      await Employee.findByIdAndUpdate(
        previousHolder,
        { $inc: { assignedAssetsCount: -1 } },
        { session },
      );
    }

    await AuditLog.create(
      [
        {
          action: returnStatus,
          entityType: "Asset",
          entityId: asset._id,
          performedBy: req.user._id,
          targetEmployee: previousHolder,
          description: `Asset ${asset.model} returned and marked as ${returnStatus}.`,
        },
      ],
      { session },
    );

    await session.commitTransaction();
    res
      .status(200)
      .json({ status: "success", message: "Asset successfully returned" });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
});

/**
 * @desc    Mark repair as complete
 */
export const completeRepair = catchAsync(async (req, res, next) => {
  const asset = await Asset.findOneAndUpdate(
    { _id: req.params.id, status: "UNDER_MAINTENANCE" },
    { $set: { status: "READY_TO_DEPLOY" } },
    { new: true },
  );

  if (!asset)
    return next(new AppError("Asset not found or not in repair", 404));

  await AuditLog.create({
    action: "READY_TO_DEPLOY",
    entityType: "Asset",
    entityId: asset._id,
    performedBy: req.user._id,
    description: `Repair completed for ${asset.model}. Status set to READY_TO_DEPLOY.`,
  });

  res.status(200).json({ status: "success", data: asset });
});
/**
 * @desc    Delete an asset and its associated receipt from Cloudinary
 * @route   DELETE /api/assets/:id
 * @access  Admin
 */
export const deleteAsset = catchAsync(async (req, res, next) => {
  const asset = await Asset.findById(req.params.id);

  if (!asset) {
    return next(new AppError("No asset found with that ID", 404));
  }

  // 1. Prevent deletion if currently allocated
  if (asset.status === "ALLOCATED") {
    return next(
      new AppError(
        "Cannot delete an asset that is currently allocated to an employee. Return it first.",
        400,
      ),
    );
  }

  // 2. Delete receipt from Cloudinary if it exists
  if (asset.receiptUrl) {
    try {
      // Extracts 'assets/receipts/receipt_SN123_123456' from the full URL
      const urlParts = asset.receiptUrl.split("/");
      const fileName = urlParts[urlParts.length - 1].split(".")[0];
      const folderName = urlParts[urlParts.length - 3]; // "assets"
      const subFolder = urlParts[urlParts.length - 2]; // "receipts"

      const publicId = `${folderName}/${subFolder}/${fileName}`;

      await cloudinary.uploader.destroy(publicId);
    } catch (cloudinaryErr) {
      console.error("Cloudinary Delete Failed:", cloudinaryErr);
      // We continue deleting from DB even if image delete fails to prevent "stuck" records
    }
  }

  // 3. Remove from Database
  await Asset.findByIdAndDelete(req.params.id);

  // 4. Log the deletion
  await AuditLog.create({
    action: "DELETED",
    entityType: "Asset",
    entityId: req.params.id,
    performedBy: req.user._id,
    description: `Permanently deleted ${asset.model} (SN: ${asset.serialNumber}) and its receipt.`,
  });

  res.status(204).json({
    status: "success",
    data: null,
  });
});
