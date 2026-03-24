import Request from "../models/Request.js";
import AuditLog from "../models/AuditLog.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

/**
 * @desc    Create a new inventory request or report
 * @route   POST /api/requests
 * @access  Private
 */
export const createRequest = catchAsync(async (req, res, next) => {
  const { type, priority, title, description, itemCategory, itemId } = req.body;

  const request = await Request.create({
    employeeId: req.user._id,
    type,
    priority,
    title,
    description,
    itemCategory,
    itemId,
  });

  await AuditLog.create({
    action: "REQUESTED",
    entityType: "Request",
    entityId: request._id,
    performedBy: req.user._id,
    description: `Submitted a new ${priority} priority ticket: ${title}`,
  });

  res.status(201).json({
    status: "success",
    data: request,
  });
});

/**
 * @desc    Get all requests (Admin) or User requests (Staff)
 * @route   GET /api/requests
 * @access  Private
 */
export const getRequests = catchAsync(async (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 50));
  const skip = (page - 1) * limit;

  let filter = {};
  
  // Staff can only see their own requests
  if (req.user.roleAccess === "STAFF") {
    filter = { employeeId: req.user._id };
  }

  const [requests, total] = await Promise.all([
    Request.find(filter)
      .populate("employeeId", "name email department role")
      .populate("itemId")
      .sort("-createdAt")
      .skip(skip)
      .limit(limit)
      .lean(),
    Request.countDocuments(filter),
  ]);

  res.status(200).json({
    status: "success",
    results: requests.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
    data: requests,
  });
});

/**
 * @desc    Get single request
 * @route   GET /api/requests/:id
 * @access  Private
 */
export const getRequest = catchAsync(async (req, res, next) => {
  const request = await Request.findById(req.params.id)
    .populate("employeeId", "name email department role")
    .populate("itemId");

  if (!request) {
    return next(new AppError("Request not found", 404));
  }

  // Ensure staff can only see their own request
  if (req.user.roleAccess === "STAFF" && request.employeeId._id.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized", 403));
  }

  res.status(200).json({
    status: "success",
    data: request,
  });
});

/**
 * @desc    Update request status (Admin only)
 * @route   PATCH /api/requests/:id
 * @access  Admin
 */
export const updateRequestStatus = catchAsync(async (req, res, next) => {
  const { status, adminNote } = req.body;

  if (req.user.roleAccess !== "ADMIN") {
    return next(new AppError("Only admins can update request status", 403));
  }

  const request = await Request.findByIdAndUpdate(
    req.params.id,
    { status, adminNote },
    { new: true, runValidators: true }
  );

  if (!request) {
    return next(new AppError("Request not found", 404));
  }

  // Determine appropriate action word based on the status selected
  const auditAction = status === "APPROVED" ? "APPROVED" : 
                      status === "REJECTED" ? "REJECTED" : 
                      status === "FULFILLED" ? "FULFILLED" : "MODIFIED";

  await AuditLog.create({
    action: auditAction,
    entityType: "Request",
    entityId: request._id,
    performedBy: req.user._id,
    targetEmployee: request.employeeId,
    description: `Ticket status set to ${status}: ${request.title}`,
  });

  res.status(200).json({
    status: "success",
    data: request,
  });
});

/**
 * @desc    Delete a request
 * @route   DELETE /api/requests/:id
 * @access  Private
 */
export const deleteRequest = catchAsync(async (req, res, next) => {
  const request = await Request.findById(req.params.id);

  if (!request) {
    return next(new AppError("Request not found", 404));
  }

  // Authorization Check:
  // 1. Admin can delete anything
  // 2. Staff can only delete their own PENDING requests
  const isOwner = request.employeeId.toString() === req.user._id.toString();
  const isAdmin = req.user.roleAccess === "ADMIN";

  if (!isAdmin) {
    if (!isOwner) {
      return next(new AppError("You do not have permission to delete this request", 403));
    }
    if (request.status !== "PENDING") {
      return next(new AppError("Only pending requests can be deleted by staff", 400));
    }
  }

  await Request.findByIdAndDelete(req.params.id);

  // Log the deletion
  await AuditLog.create({
    action: "DELETED",
    entityType: "Request",
    entityId: request._id,
    performedBy: req.user._id,
    targetEmployee: request.employeeId,
    description: `Deleted ${request.priority} priority ticket: ${request.title}`,
  });

  res.status(204).json({
    status: "success",
    data: null,
  });
});
