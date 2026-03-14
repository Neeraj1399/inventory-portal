// import Employee from "../models/Employee.js";
// import { processFullOffboard } from "../services/offboardingservice.js";
// import AppError from "../utils/appError.js";
// import Asset from "../models/Asset.js";
// import Consumable from "../models/Consumable.js";
// import AuditLog from "../models/AuditLog.js";

// export async function getEmployees(req, res, next) {
//   try {
//     const employees = await Employee.aggregate([
//       {
//         $lookup: {
//           from: "assets",
//           localField: "_id",
//           foreignField: "assignedTo",
//           as: "assets",
//         },
//       },

//       {
//         $lookup: {
//           from: "consumables",
//           let: { empId: "$_id" },
//           pipeline: [
//             // Flatten the assignments array inside every consumable item
//             { $unwind: "$assignments" },
//             // Filter only those assigned to this specific employee
//             {
//               $match: {
//                 $expr: { $eq: ["$assignments.employeeId", "$$empId"] },
//               },
//             },
//           ],
//           as: "personalConsumables",
//         },
//       },
//       {
//         $addFields: {
//           assignedAssetsCount: { $size: "$assets" },
//           // Count the flattened assignment entries found
//           assignedConsumablesCount: { $size: "$personalConsumables" },
//         },
//       },
//       {
//         $project: {
//           password: 0,
//           assets: 0,
//           personalConsumables: 0,
//           __v: 0,
//         },
//       },
//       { $match: { status: "ACTIVE" } },
//     ]);

//     res.status(200).json({ status: "success", data: employees });
//   } catch (err) {
//     next(err);
//   }
// }

// /**
//  * @desc    Get single employee by ID
//  * @route   GET /api/employees/:id
//  * @access  Admin
//  */
// export async function getEmployeeById(req, res, next) {
//   try {
//     const employee = await Employee.findById(req.params.id).select("-password");
//     if (!employee) return next(new AppError("Employee not found", 404));

//     res.status(200).json({ status: "success", data: employee });
//   } catch (err) {
//     next(err);
//   }
// }

// /**
//  * @desc    Create new employee
//  * @route   POST /api/employees
//  * @access  Admin
//  */
// export async function createEmployee(req, res, next) {
//   try {
//     const { name, email, type, password, role, department, level } = req.body;

//     // Password complexity validation
//     const passwordRegex =
//       /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{10,}$/;
//     if (!password || !passwordRegex.test(password)) {
//       return next(
//         new AppError(
//           "Password must be 10 characters long and include: one uppercase, one lowercase, one number, and one special character (!@#$%^&*)",
//           400,
//         ),
//       );
//     }

//     // Prevent creating ADMIN through this endpoint
//     if (role === "ADMIN") {
//       return next(
//         new AppError("Only one administrator is allowed at this time.", 403),
//       );
//     }

//     // Check for existing email
//     const existing = await Employee.findOne({ email });
//     if (existing) return next(new AppError("Email already exists", 400));

//     // Create employee
//     const newEmployee = await Employee.create({
//       name,
//       email,
//       department,
//       role,
//       level,
//       type: type.toUpperCase(),
//       password,
//       roleAccess: "STAFF",
//       status: "ACTIVE",
//     });

//     res.status(201).json({
//       status: "success",
//       data: {
//         id: newEmployee._id,
//         name: newEmployee.name,
//         email: newEmployee.email,
//         department: newEmployee.department,
//         role: newEmployee.role,
//         level: newEmployee.level,
//       },
//     });
//   } catch (err) {
//     next(err);
//   }
// }

// /**
//  * @desc    Update employee
//  * @route   PATCH /api/employees/:id
//  * @access  Admin
//  */
// // export async function updateEmployee(req, res, next) {
// //   try {
// //     const { name, email, department, role, level, type, status } = req.body;

// //     const employee = await Employee.findById(req.params.id);
// //     if (!employee) return next(new AppError("Employee not found", 404));

// //     // Prevent updating ADMIN role access accidentally
// //     if (role === "ADMIN") {
// //       return next(
// //         new AppError("Cannot assign ADMIN role through this endpoint", 403),
// //       );
// //     }

// //     employee.name = name || employee.name;
// //     employee.email = email || employee.email;
// //     employee.department = department || employee.department;
// //     employee.role = role || employee.role;
// //     employee.level = level || employee.level;
// //     employee.type = type ? type.toUpperCase() : employee.type;
// //     employee.status = status || employee.status;

// //     await employee.save();

// //     res.status(200).json({
// //       status: "success",
// //       data: employee,
// //     });
// //   } catch (err) {
// //     next(err);
// //   }
// // }
// /**
//  * @desc    Update employee (Admin or Self)
//  * @route   PATCH /api/employees/:id
//  */
// export async function updateEmployee(req, res, next) {
//   try {
//     const { name, email, department, role, level, type, status } = req.body;
//     const employee = await Employee.findById(req.params.id);

//     if (!employee) return next(new AppError("Employee not found", 404));

//     // SECURITY CHECK:
//     // If the person logged in is NOT an admin, they can only update their own ID
//     const isSelfUpdate = req.user._id.toString() === req.params.id;
//     const isAdmin = req.user.role === "ADMIN";

//     if (!isAdmin && !isSelfUpdate) {
//       return next(
//         new AppError("You do not have permission to update this profile", 403),
//       );
//     }

//     // 1. Basic Info (Always updatable by self or admin)
//     employee.name = name || employee.name;
//     employee.email = email || employee.email;

//     // 2. Restricted Info (Only updatable by ADMIN)
//     if (isAdmin) {
//       if (role === "ADMIN" && employee.role !== "ADMIN") {
//         return next(
//           new AppError("Cannot assign ADMIN role through this endpoint", 403),
//         );
//       }

//       employee.department = department || employee.department;
//       employee.role = role || employee.role;
//       employee.level = level || employee.level;
//       employee.type = type ? type.toUpperCase() : employee.type;
//       employee.status = status || employee.status;
//     }

//     await employee.save();

//     res.status(200).json({
//       status: "success",
//       data: {
//         _id: employee._id,
//         name: employee.name,
//         email: employee.email,
//         role: employee.role,
//         department: employee.department,
//       },
//     });
//   } catch (err) {
//     next(err);
//   }
// }

// /**
//  * @desc    Delete employee
//  * @route   DELETE /api/employees/:id
//  * @access  Admin
//  */
// export async function deleteEmployee(req, res, next) {
//   try {
//     const employee = await Employee.findByIdAndDelete(req.params.id);
//     if (!employee) return next(new AppError("Employee not found", 404));

//     res.status(204).json({ status: "success", data: null });
//   } catch (err) {
//     next(err);
//   }
// }

// /**
//  * @desc    Offboard an employee
//  * @route   PATCH /api/employees/:id/offboard
//  * @access  Admin
//  */
// // export async function offboardEmployee(req, res, next) {
// //   try {
// //     const result = await processFullOffboard(req.params.id, req.user._id);

// //     res.status(200).json({
// //       status: "success",
// //       data: result,
// //     });
// //   } catch (err) {
// //     next(err);
// //   }
// // }

// export const offboardEmployee = async (req, res) => {
//   const { id } = req.params;

//   const employee = await Employee.findById(id);
//   if (!employee) {
//     return res.status(404).json({ message: "Employee not found" });
//   }

//   const assignedAssets = await Asset.countDocuments({
//     assignedTo: id,
//     status: { $in: ["ASSIGNED", "REPAIR"] },
//   });

//   const assignedConsumables = await Consumable.countDocuments({
//     assignedTo: id,
//     quantity: { $gt: 0 },
//   });

//   if (assignedAssets > 0 || assignedConsumables > 0) {
//     return res.status(400).json({
//       message: "Employee still has assigned inventory",
//       assets: assignedAssets,
//       consumables: assignedConsumables,
//     });
//   }

//   employee.status = "OFFBOARDED";

//   employee.offboardedAt = new Date();
//   await employee.save();

//   await AuditLog.create({
//     action: "OFFBOARDED",
//     entityType: "Employee",
//     entityId: employee._id,
//     performedBy: req.user._id,
//     description: `Employee ${employee.name} offboarded`,
//   });

//   res.json({
//     message: "Employee successfully offboarded",
//   });
// };
// /**
//  * @desc    Promote an employee to ADMIN
//  * @route   PATCH /api/employees/:id/promote
//  * @access  Admin Only
//  */
// export async function promoteToAdmin(req, res, next) {
//   try {
//     const employee = await Employee.findByIdAndUpdate(
//       req.params.id,
//       { roleAccess: "ADMIN" },
//       { new: true, runValidators: true },
//     );

//     if (!employee) return next(new AppError("Employee not found", 404));

//     res.status(200).json({
//       status: "success",
//       message: `${employee.name} is now an Admin.`,
//       data: employee,
//     });
//   } catch (err) {
//     next(err);
//   }
// }
// /**
//  * @desc    Reset Staff Password (Admin Only)
//  * @route   PATCH /api/employees/:id/reset-password
//  */
// export async function resetStaffPassword(req, res, next) {
//   try {
//     const { newPassword } = req.body;

//     // 1. Basic validation
//     if (!newPassword || newPassword.length < 10) {
//       return next(
//         new AppError(
//           "Please provide a valid temporary password (min 10 chars).",
//           400,
//         ),
//       );
//     }

//     const employee = await Employee.findById(req.params.id);
//     if (!employee) return next(new AppError("Employee not found", 404));

//     // 2. Update password and force reset flag
//     employee.password = newPassword;
//     employee.passwordResetRequired = true; // This triggers the redirect in your Frontend

//     await employee.save();

//     // 3. Log the action
//     await AuditLog.create({
//       action: "PASSWORD_RESET_BY_ADMIN",
//       entityType: "Employee",
//       entityId: employee._id,
//       performedBy: req.user._id,
//       description: `Admin reset password for ${employee.name}`,
//     });

//     res.status(200).json({
//       status: "success",
//       message:
//         "Password reset successfully. User must change it at next login.",
//     });
//   } catch (err) {
//     next(err);
//   }
// }
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
    const employees = await Employee.aggregate([
      {
        $lookup: {
          from: "assets",
          localField: "_id",
          foreignField: "assignedTo",
          as: "assets",
        },
      },
      {
        $addFields: {
          assignedAssetsCount: { $size: "$assets" },
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
    ]);

    res.status(200).json({ status: "success", data: employees });
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
    const { name, email, type, role, department, level } = req.body;

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
      roleAccess: "STAFF",
      status: "ACTIVE",
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
 */
export async function updateEmployee(req, res, next) {
  try {
    const { name, email, department, role, level, type, status } = req.body;
    const employee = await Employee.findById(req.params.id);

    if (!employee) return next(new AppError("Employee not found", 404));

    const isSelfUpdate = req.user._id.toString() === req.params.id;
    const isAdmin = req.user.roleAccess === "ADMIN";

    if (!isAdmin && !isSelfUpdate) {
      return next(new AppError("Not authorized to update this profile", 403));
    }

    employee.name = name || employee.name;
    employee.email = email || employee.email;

    if (isAdmin) {
      employee.department = department || employee.department;
      employee.role = role || employee.role;
      employee.level = level || employee.level;
      employee.type = type ? type.toUpperCase() : employee.type;
      employee.status = status || employee.status;
    }

    await employee.save();
    res.status(200).json({ status: "success", data: employee });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Offboard an employee
 */
export async function offboardEmployee(req, res, next) {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);

    if (!employee) return next(new AppError("Employee not found", 404));

    const assignedAssets = await Asset.countDocuments({
      assignedTo: id,
      status: { $in: ["ASSIGNED", "REPAIR"] },
    });

    if (assignedAssets > 0) {
      return next(
        new AppError(
          `Employee still has ${assignedAssets} assets assigned.`,
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
      assignedTo: req.user.id,
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
    const updated = await Employee.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true, runValidators: true },
    ).select("-password");
    res.status(200).json({ status: "success", data: updated });
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
      assignedTo: req.user._id,
    });
    if (!asset)
      return next(new AppError("Asset not found or not assigned to you.", 404));

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
