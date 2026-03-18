import Employee from "../models/Employee.js";
import Asset from "../models/Asset.js";
import AuditLog from "../models/AuditLog.js";
import AppError from "../utils/appError.js";
import sendEmail from "../utils/email.js";
import crypto from "crypto";
// --- ADMIN & MANAGEMENT FUNCTIONS ---

/**
 * @desc    Get all employees with asset/consumable counts (Admin Dashboard)
 */
export async function getEmployees(req, res, next) {
  try {
    const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || "").toLowerCase();
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;

    const result = await Employee.aggregate([
      {
        $lookup: {
          from: "assets",
          localField: "_id",
          foreignField: "allocatedTo",
          as: "assets",
        },
      },
      {
        $addFields: {
          assignedAssetsCount: { $size: "$assets" },
          isSuperAdmin: {
            $eq: [{ $toLower: "$email" }, superAdminEmail],
          },
        },
      },
      {
        $project: {
          password: 0,
          assets: 0,
          __v: 0,
        },
      },
      { $match: { status: "ACTIVE" } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);

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
  } catch (err) {
    next(err);
  }
}

// /**
//  * @desc    Create new employee
//  */
// export async function createEmployee(req, res, next) {
//   try {
//     const { name, email, type, password, role, department, level } = req.body;

//     const passwordRegex =
//       /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{10,}$/;
//     if (!password || !passwordRegex.test(password)) {
//       return next(
//         new AppError(
//           "Password must be 10 characters with upper, lower, number, and special char.",
//           400,
//         ),
//       );
//     }

//     const existing = await Employee.findOne({ email });
//     if (existing) return next(new AppError("Email already exists", 400));

//     const newEmployee = await Employee.create({
//       name,
//       email,
//       department,
//       role,
//       level,
//       type: type?.toUpperCase() || "PERMANENT",
//       password,
//       roleAccess: "STAFF",
//       status: "ACTIVE",
//     });

//     res.status(201).json({ status: "success", data: newEmployee });
//   } catch (err) {
//     next(err);
//   }
// }
/**
 * @desc    Create new employee and send temporary password via email
 */
export async function createEmployee(req, res, next) {
  try {
    const { name, email, type, role, department, level, roleAccess } = req.body;

    // 1. Check for existing email
    const existing = await Employee.findOne({ email });
    if (existing) return next(new AppError("Email already exists", 400));

    // 2. Generate a secure random temporary password
    // This creates an 8-character string like 'a1b2c3d4'
    const tempPassword = crypto.randomBytes(4).toString("hex");

    // 3. Create employee in DB
    // Note: passwordResetRequired is true by default in your model
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
      // If email fails, we don't want to crash the app, but we should inform the admin
      console.error("Email Error:", err);
      res.status(201).json({
        status: "success",
        message:
          "Employee created, but the welcome email failed to send. Please reset password manually.",
        data: newEmployee,
      });
    }
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Update employee (Admin or Self)
 * @security Super Admin protection, last-admin check, self-demotion prevention
 */
export async function updateEmployee(req, res, next) {
  try {
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

    await AuditLog.create({
      action: "PROFILE_UPDATED",
      entityType: "Employee",
      entityId: employee._id,
      performedBy: req.user._id,
      description: `Profile updated for ${employee.name} (${employee.email}). Fields: ${Object.keys(req.body).join(", ")}`,
      metadata: req.body,
    });

    res.status(200).json({ status: "success", data: employee });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Offboard an employee
 * @security Super Admin cannot be offboarded
 */
export async function offboardEmployee(req, res, next) {
  try {
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
  } catch (err) {
    next(err);
  }
}

// --- STAFF / SELF-SERVICE FUNCTIONS ---

export async function getMyProfile(req, res, next) {
  try {
    const employee = await Employee.findById(req.user.id).select("-password");
    const assetsCount = await Asset.countDocuments({
      allocatedTo: req.user.id,
      isDeleted: { $ne: true },
    });

    res.status(200).json({
      status: "success",
      data: { profile: employee, stats: { assetsCount } },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateMe(req, res, next) {
  try {
    const { name, email } = req.body;
    const modified = await Employee.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true, runValidators: true },
    ).select("-password");
    res.status(200).json({ status: "success", data: modified });
  } catch (err) {
    next(err);
  }
}

export async function requestItem(req, res, next) {
  try {
    const { itemType, itemName, reason, priority } = req.body;
    const requestLog = await AuditLog.create({
      action: "ITEM_REQUEST",
      entityType: itemType,
      performedBy: req.user._id,
      description: `User ${req.user.name} requested ${itemName}.`,
      metadata: { itemName, priority, status: "PENDING" },
    });
    res.status(201).json({ status: "success", data: requestLog });
  } catch (err) {
    next(err);
  }
}

export async function reportAssetIssue(req, res, next) {
  try {
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
  } catch (err) {
    next(err);
  }
}

export async function requestPasswordReset(req, res, next) {
  try {
    await AuditLog.create({
      action: "PASSWORD_RESET_REQUEST",
      entityType: "Employee",
      entityId: req.user._id,
      performedBy: req.user._id,
      description: `User ${req.user.name} requested a password reset.`,
    });
    res.status(200).json({ status: "success", message: "Reset request sent." });
  } catch (err) {
    next(err);
  }
}
