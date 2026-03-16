import Request from "../models/Request.js";
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
  let filter = {};
  
  // Staff can only see their own requests
  if (req.user.roleAccess === "STAFF") {
    filter = { employeeId: req.user._id };
  }

  const requests = await Request.find(filter)
    .populate("employeeId", "name email department role")
    .populate("itemId")
    .sort("-createdAt");

  res.status(200).json({
    status: "success",
    results: requests.length,
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

  res.status(200).json({
    status: "success",
    data: request,
  });
});
