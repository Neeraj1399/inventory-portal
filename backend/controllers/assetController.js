import Employee from "../models/Employee.js";
import Asset from "../models/Asset.js";
import AuditLog from "../models/AuditLog.js";
import AppError from "../utils/appError.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";
import mongoose from "mongoose";
import catchAsync from "../utils/catchAsync.js";

// --- 1. RETRIEVAL CONTROLLERS ---

export const getAssets = catchAsync(async (req, res, next) => {
  const { search, status, category, allocatedTo } = req.query;
  let query = {};

  if (req.user.role === "STAFF") {
    query.allocatedTo = req.user._id;
  } else {
    if (allocatedTo) query.allocatedTo = allocatedTo;

    // Search by Model or Serial
    if (search?.trim()) {
      query.$or = [
        { model: { $regex: search.trim(), $options: "i" } },
        { serialNumber: { $regex: search.trim(), $options: "i" } },
      ];
    }

    if (status && status !== "ALL") query.status = status;

    // MODIFIED: Asset Classification filtering now supports partial text search
    // since it is no longer a fixed dropdown
    if (category?.trim()) {
      query.category = { $regex: category.trim(), $options: "i" };
    }
  }

  const assets = await Asset.find(query)
    .populate({ path: "allocatedTo", select: "name email" })
    .sort("-createdAt");

  res.status(200).json({
    status: "success",
    results: assets.length,
    data: assets,
  });
});

export const getAsset = catchAsync(async (req, res, next) => {
  const asset = await Asset.findById(req.params.id).populate({
    path: "allocatedTo",
    select: "name email department",
  });
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
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "assets/receipts",
      public_id: `receipt_${serialNumber}_${Date.now()}`,
    });
    receiptUrl = result.secure_url;
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
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

  res.status(201).json({ status: "success", data: newAsset });
});

export const updateAsset = catchAsync(async (req, res, next) => {
  const asset = await Asset.findById(req.params.id);
  if (!asset) {
    if (req.file) fs.unlinkSync(req.file.path);
    return next(new AppError("Asset not found", 404));
  }

  const updateData = { ...req.body };

  if (updateData.purchasePrice)
    updateData.purchasePrice = Number(updateData.purchasePrice);
  if (updateData.warrantyMonths)
    updateData.warrantyMonths = Number(updateData.warrantyMonths);

  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "assets/receipts",
      public_id: `receipt_${updateData.serialNumber || asset.serialNumber}_${Date.now()}`,
    });
    updateData.receiptUrl = result.secure_url;
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
  }

  const updatedAsset = await Asset.findByIdAndUpdate(
    req.params.id,
    { $set: updateData },
    { new: true, runValidators: true },
  );

  await AuditLog.create({
    action: "MODIFIED",
    entityType: "Asset",
    entityId: asset._id,
    performedBy: req.user._id,
    description: `Modified details for ${updatedAsset.model}.`,
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
    fs.unlinkSync(req.file.path);
    return next(new AppError("Asset not found.", 404));
  }

  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: "assets/receipts",
    public_id: `receipt_${asset.serialNumber}_${Date.now()}`,
  });

  asset.receiptUrl = result.secure_url;
  await asset.save();
  if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

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
    const returnStatus = req.body?.returnStatus || "READY_TO_DEPLOY";
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
          action: "RECOVERED",
          entityType: "Asset",
          entityId: asset._id,
          performedBy: req.user._id,
          targetEmployee: previousHolder,
          description: `Asset ${asset.model} returned as ${returnStatus}.`,
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
    action: "MODIFIED",
    entityType: "Asset",
    entityId: asset._id,
    performedBy: req.user._id,
    description: `Repair completed for ${asset.model}. Returned to stock.`,
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
