import Request from "../models/Request.js";
import AuditLog from "../models/AuditLog.js";

/**
 * @desc    Create a new inventory request or report
 */
export const createRequest = async (req, res, next) => {
  try {
    const { type, requestType, category, priority, title, description, itemCategory, itemId } = req.body;

    const request = await Request.create({
      employeeId: req.user._id,
      type,
      requestType,
      category,
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
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all requests
 */
export const getRequests = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    let filter = {};
    if (req.user.roleAccess === "STAFF") {
      filter.employeeId = req.user._id;
    }
    if (status && status !== "ALL") {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const requests = await Request.find(filter)
      .populate("employeeId", "name email")
      .sort("-createdAt")
      .skip(skip)
      .limit(limit);

    const total = await Request.countDocuments(filter);

    res.status(200).json({
      status: "success",
      results: requests.length,
      total,
      pages: Math.ceil(total / limit),
      data: requests,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single request
 */
export const getRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate("employeeId", "name email")
      .populate("itemId");

    if (!request) return res.status(404).json({ message: "Request not found" });

    const isOwner = request.employeeId?._id?.toString() === req.user._id.toString();
    if (req.user.roleAccess !== "ADMIN" && !isOwner) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json({ status: "success", data: request });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update request status (Admin only)
 */
export const updateRequestStatus = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;

    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status, adminNote },
      { new: true, runValidators: true }
    );

    if (!request) return res.status(404).json({ message: "Request not found" });

    await AuditLog.create({
      action: "MODIFIED",
      entityType: "Request",
      entityId: request._id,
      performedBy: req.user._id,
      description: `Ticket status set to ${status}: ${request.title}`,
    });

    res.status(200).json({ status: "success", data: request });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete a request
 */
export const deleteRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    const isOwner = request.employeeId?.toString() === req.user._id.toString();
    if (req.user.roleAccess !== "ADMIN" && !isOwner) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Request.findByIdAndDelete(req.params.id);

    await AuditLog.create({
      action: "DELETED",
      entityType: "Request",
      entityId: request._id,
      performedBy: req.user._id,
      description: `Deleted ticket: ${request.title}`,
    });

    res.status(204).json({ status: "success", data: null });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get request stats
 */
export const getRequestStats = async (req, res, next) => {
  try {
    const stats = await Request.aggregate([
      {
        $project: {
          status: 1,
          priority: 1,
          requestType: 1,
          category: {
             $cond: {
               if: { $in: [{ $ifNull: ["$category", ""] }, ["", " "]] },
               then: "Others",
               else: "$category"
             }
          }
        }
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] }
          },
          immediate: {
            $sum: { 
              $cond: [
                { 
                  $and: [
                    { $eq: ["$status", "PENDING"] },
                    { 
                      $or: [
                        { $eq: ["$priority", "HIGH"] },
                        { $eq: ["$type", "INCIDENT"] }
                      ] 
                    }
                  ] 
                }, 
                1, 
                0
              ] 
            }
          },
          breakdown: {
            $push: "$requestType"
          }
        }
      },
      {
        $project: {
          _id: 1,
          total: 1,
          pending: 1,
          immediate: 1,
          breakdown: {
            $map: {
              input: ["NEW", "REPLACEMENT"],
              as: "type",
              in: {
                type: "$$type",
                count: {
                  $size: {
                    $filter: {
                      input: "$breakdown",
                      as: "bt",
                      cond: { $eq: ["$$bt", "$$type"] }
                    }
                  }
                }
              }
            }
          }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.status(200).json({ status: "success", data: stats });
  } catch (err) {
    next(err);
  }
};
