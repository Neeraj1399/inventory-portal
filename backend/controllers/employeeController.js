import Employee from "../models/Employee.js";
import Asset from "../models/Asset.js";
import AuditLog from "../models/AuditLog.js";
import AppError from "../utils/appError.js";
import sendEmail from "../utils/email.js";
import crypto from "crypto";
import catchAsync from "../utils/catchAsync.js";

// --- ADMIN & MANAGEMENT FUNCTIONS ---

/**
 * @desc    Get all employees with asset/consumable counts (Admin Dashboard)
 */
export const getEmployees = catchAsync(async (req, res, next) => {
  const { search, status } = req.query;
  const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || "").toLowerCase();
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 50));
  const skip = (page - 1) * limit;

  const pipeline = [];

  // Filter by status (ACTIVE or INACTIVE)
  if (status) {
    pipeline.push({ $match: { status } });
  } else {
    // Default to ACTIVE if no status provided
    pipeline.push({ $match: { status: "ACTIVE" } });
  }

  // Filter by search term
  if (search?.trim()) {
    pipeline.push({
      $match: {
        $or: [
          { name: { $regex: search.trim(), $options: "i" } },
          { email: { $regex: search.trim(), $options: "i" } },
          { department: { $regex: search.trim(), $options: "i" } },
        ],
      },
    });
  }

  // 1. Hardware Lookup
  pipeline.push({
    $lookup: {
      from: "assets",
      localField: "_id",
      foreignField: "allocatedTo",
      as: "assets",
    },
  });

  // 2. Consumables Lookup and Summation
  pipeline.push({
    $lookup: {
      from: "consumables",
      let: { empId: "$_id" },
      pipeline: [
        { $unwind: "$assignments" },
        {
          $match: {
            $expr: { $eq: ["$assignments.employeeId", "$$empId"] },
          },
        },
        {
          $group: {
            _id: null,
            totalQuantity: { $sum: "$assignments.quantity" },
          },
        },
      ],
      as: "consumableStats",
    },
  });

  // 3. Count Fields and Admin Check
  pipeline.push({
    $addFields: {
      assignedAssetsCount: { $size: "$assets" },
      assignedConsumablesCount: {
        $ifNull: [{ $arrayElemAt: ["$consumableStats.totalQuantity", 0] }, 0],
      },
      isSuperAdmin: {
        $eq: [{ $toLower: "$email" }, superAdminEmail],
      },
    },
  });

  // 4. Clean up large fields
  pipeline.push({
    $project: {
      password: 0,
      assets: 0,
      __v: 0,
    },
  });

  // 5. Facet for pagination and total count
  pipeline.push({
    $facet: {
      data: [{ $skip: skip }, { $limit: limit }],
      totalCount: [{ $count: "count" }],
    },
  });

  const result = await Employee.aggregate(pipeline);

  const employees = result[0]?.data || [];
  const total = result[0]?.totalCount[0]?.count || 0;

  res.status(200).json({
    status: "success",
    results: employees.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
    data: employees,
  });
});

/**
 * @desc    Create new employee and send temporary password via email
 */
export const createEmployee = catchAsync(async (req, res, next) => {
  const { name, email, type, role, department, level, roleAccess } = req.body;

  // 1. Check for existing email
  const existing = await Employee.findOne({ email });
  if (existing) return next(new AppError("Email already exists", 400));

  // 2. Generate a secure random temporary password
  const tempPassword = crypto.randomBytes(4).toString("hex");

  // 3. Create employee in DB
  const newEmployee = await Employee.create({
    name,
    email,
    department,
    role,
    level,
    type: type?.toUpperCase() || "PERMANENT",
    password: tempPassword,
    roleAccess: roleAccess || "STAFF",
    status: "ACTIVE",
  });

  await AuditLog.create({
    action: "EMPLOYEE_CREATED",
    entityType: "Employee",
    entityId: newEmployee._id,
    performedBy: req.user._id,
    description: `New employee registered: ${newEmployee.name} (${newEmployee.email}) with ${newEmployee.roleAccess} access.`,
  });

  // 4. Send the Email
  const message = `Welcome to the team, ${name}!\n\nYour account has been created on the Inventory Portal.\n\nPlease log in with the following credentials:\nEmail: ${email}\nTemporary Password: ${tempPassword}\n\nYou will be required to change your password immediately after logging in for security purposes.`;

  try {
    await sendEmail({
      email: newEmployee.email,
      subject: "Your Inventory Portal Credentials",
      message,
    });

    res.status(201).json({
      status: "success",
      message: "Employee created and email sent.",
      data: { id: newEmployee._id, email: newEmployee.email },
    });
  } catch (err) {
    console.error("Email Error:", err);
    res.status(201).json({
      status: "success",
      message:
        "Employee created, but the welcome email failed to send. Please reset password manually.",
      data: newEmployee,
    });
  }
});

/**
 * @desc    Update employee (Admin or Self)
 * @security Super Admin protection, last-admin check, self-demotion prevention
 */
export const updateEmployee = catchAsync(async (req, res, next) => {
  const { name, email, department, role, level, type, status, roleAccess } = req.body;
  const employee = await Employee.findById(req.params.id);

  if (!employee) return next(new AppError("Employee not found", 404));

  const isSelfUpdate = req.user._id.toString() === req.params.id;
  const isAdmin = req.user.roleAccess === "ADMIN";

  if (!isAdmin && !isSelfUpdate) {
    return next(new AppError("Not authorized to update this profile", 403));
  }

  // --- SECURITY: Role Change Safeguards ---
  const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || "").toLowerCase();
  const isTargetSuperAdmin = employee.email.toLowerCase() === superAdminEmail;
  const isRoleDemotion = roleAccess && roleAccess === "STAFF" && employee.roleAccess === "ADMIN";

  // Rule 1: Super Admin account can NEVER be demoted
  if (isTargetSuperAdmin && roleAccess && roleAccess !== employee.roleAccess) {
    return next(new AppError("This is a protected Super Admin account. Its role cannot be changed.", 403));
  }

  // Rule 2: Admins cannot demote themselves
  if (isSelfUpdate && isRoleDemotion) {
    return next(new AppError("You cannot demote yourself. Ask another administrator to change your role.", 403));
  }

  // Rule 3: System must always have at least one active admin
  if (isRoleDemotion) {
    const activeAdminCount = await Employee.countDocuments({
      roleAccess: "ADMIN",
      status: "ACTIVE",
    });
    if (activeAdminCount <= 1) {
      return next(new AppError("Cannot demote the last remaining administrator. Promote another staff member to Admin first.", 403));
    }
  }

  // Track if roleAccess is actually changing for the audit log
  const roleAccessHasChanged = roleAccess && roleAccess !== employee.roleAccess;

  // --- Apply Updates ---
  employee.name = name || employee.name;
  employee.email = email || employee.email;

  if (isAdmin) {
    employee.department = department || employee.department;
    employee.role = role || employee.role;
    employee.level = level || employee.level;
    employee.type = type ? type.toUpperCase() : employee.type;
    employee.status = status || employee.status;
    employee.roleAccess = roleAccess || employee.roleAccess;
  }

  await employee.save();

  // Determine target name or email for clean logging
  const target = employee.name || employee.email;
  const logDescription = roleAccessHasChanged 
    ? `Role access updated for ${target}` 
    : `Profile updated for ${target}`;

  await AuditLog.create({
    action: "PROFILE_UPDATED",
    entityType: "Employee",
    entityId: employee._id,
    performedBy: req.user._id,
    description: logDescription,
    metadata: req.body,
  });

  res.status(200).json({ status: "success", data: employee });
});

/**
 * @desc    Offboard an employee
 * @security Super Admin cannot be offboarded
 */
export const offboardEmployee = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const employee = await Employee.findById(id);

  if (!employee) return next(new AppError("Employee not found", 404));

  // SECURITY: Super Admin cannot be offboarded
  const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || "").toLowerCase();
  if (employee.email.toLowerCase() === superAdminEmail) {
    return next(new AppError("The Super Admin account cannot be offboarded.", 403));
  }

  const assignedAssets = await Asset.countDocuments({
    allocatedTo: id,
    status: { $in: ["ALLOCATED", "UNDER_MAINTENANCE"] },
  });

  if (assignedAssets > 0) {
    return next(
      new AppError(
        `Employee still has ${assignedAssets} assets allocated.`,
        400,
      ),
    );
  }

  employee.status = "OFFBOARDED";
  employee.offboardedAt = new Date();
  await employee.save();

  await AuditLog.create({
    action: "OFFBOARDED",
    entityType: "Employee",
    entityId: employee._id,
    performedBy: req.user._id,
    description: `Employee ${employee.name} offboarded`,
  });

  res.status(200).json({ status: "success", message: "Employee offboarded" });
});

// --- STAFF / SELF-SERVICE FUNCTIONS ---

export const getMyProfile = catchAsync(async (req, res, next) => {
  const employee = await Employee.findById(req.user.id).select("-password");
  const assetsCount = await Asset.countDocuments({
    allocatedTo: req.user.id,
    isDeleted: { $ne: true },
  });

  res.status(200).json({
    status: "success",
    data: { profile: employee, stats: { assetsCount } },
  });
});

export const updateMe = catchAsync(async (req, res, next) => {
  const { name, email } = req.body;
  const modified = await Employee.findByIdAndUpdate(
    req.user.id,
    { name, email },
    { new: true, runValidators: true },
  ).select("-password");
  res.status(200).json({ status: "success", data: modified });
});

export const requestItem = catchAsync(async (req, res, next) => {
  const { itemType, itemName, priority } = req.body;
  const requestLog = await AuditLog.create({
    action: "ITEM_REQUEST",
    entityType: itemType,
    performedBy: req.user._id,
    description: `User ${req.user.name} requested ${itemName}.`,
    metadata: { itemName, priority, status: "PENDING" },
  });
  res.status(201).json({ status: "success", data: requestLog });
});

export const reportAssetIssue = catchAsync(async (req, res, next) => {
  const asset = await Asset.findOne({
    _id: req.params.id,
    allocatedTo: req.user._id,
  });
  if (!asset)
    return next(new AppError("Asset not found or not allocated to you.", 404));

  asset.status = "BROKEN";
  asset.needsMaintenance = true;
  await asset.save();

  await AuditLog.create({
    action: "ISSUE_REPORTED",
    entityType: "Asset",
    entityId: req.params.id,
    performedBy: req.user._id,
    description: `Issue reported: ${req.body.description}`,
  });

  res.status(200).json({ status: "success", message: "Issue reported." });
});

export const requestPasswordReset = catchAsync(async (req, res, next) => {
  await AuditLog.create({
    action: "PASSWORD_RESET_REQUEST",
    entityType: "Employee",
    entityId: req.user._id,
    performedBy: req.user._id,
    description: `User ${req.user.name} requested a password reset.`,
  });
  res.status(200).json({ status: "success", message: "Reset request sent." });
});
