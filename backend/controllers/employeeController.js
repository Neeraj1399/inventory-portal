// import Employee from "../models/Employee.js";
// import { processFullOffboard } from "../services/offboardingservice.js";
// import AppError from "../utils/appError.js";
// import bcrypt from "bcryptjs";
// import mongoose from "mongoose";

// /**
//  * @desc    Get all employees
//  * @route   GET /api/employees
//  * @access  Admin
//  */
// export async function getEmployees(req, res, next) {
//   try {
//     const employees = await Employee.aggregate([
//       {
//         $lookup: {
//           from: "assets",
//           localField: "_id",
//           foreignField: "assignedTo",
//           as: "assignedAssets",
//         },
//       },
//       {
//         $addFields: {
//           // If Harri has 0 assets, this will correctly be 0
//           assignedAssetsCount: { $size: "$assignedAssets" },
//         },
//       },
//       {
//         $project: {
//           password: 0,
//           assignedAssets: 0,
//           __v: 0,
//         },
//       },
//       // Optional: Ensure we only show ACTIVE employees in the assignment dropdown
//       { $match: { status: "ACTIVE" } },
//     ]);

//     res.status(200).json({ status: "success", data: employees });
//   } catch (err) {
//     next(err);
//   }
// }

// /**
//  * @desc    Add new employee
//  * @route   POST /api/employees
//  * @access  Admin
//  */
// // export async function createEmployee(req, res, next) {
// //   try {
// //     const { name, email, type, password, role, department } = req.body;

// //     // 1. Validation
// //     if (!password || password.length < 8) {
// //       return next(new AppError("Provide a password (min 8 characters)", 400));
// //     }

// //     // NEW: Restrict role to STAFF only to prevent a second Admin
// //     if (role === "ADMIN") {
// //       return next(
// //         new AppError("Only one administrator is allowed at this time.", 403),
// //       );
// //     }

// //     const existing = await Employee.findOne({ email });
// //     if (existing) return next(new AppError("Email already exists", 400));

// //     // 2. Creation
// //     const newEmployee = await Employee.create({
// //       name,
// //       email,
// //       department,
// //       type: type.toUpperCase(), // Supports FULL-TIME, PART-TIME, INTERN, CONTRACT
// //       password,
// //       role: "STAFF", // Hardcoded to ensure safety
// //       status: "ACTIVE",
// //     });

// //     res.status(201).json({
// //       status: "success",
// //       data: {
// //         id: newEmployee._id,
// //         name: newEmployee.name,
// //         email: newEmployee.email,
// //         role: newEmployee.role,
// //       },
// //     });
// //   } catch (err) {
// //     next(err);
// //   }
// // }
// export async function createEmployee(req, res, next) {
//   try {
//     const { name, email, type, password, role, department } = req.body;

//     // 1. COMPLEXITY VALIDATION
//     // Regex: 7-12 chars, 1 Upper, 1 Lower, 1 Number, 1 Special
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

//     // 2. ROLE CHECK
//     if (role === "ADMIN") {
//       return next(
//         new AppError("Only one administrator is allowed at this time.", 403),
//       );
//     }

//     const existing = await Employee.findOne({ email });
//     if (existing) return next(new AppError("Email already exists", 400));

//     // 3. CREATION
//     const newEmployee = await Employee.create({
//       name,
//       email,
//       department,
//       type: type.toUpperCase(),
//       password,
//       role: "STAFF",
//       status: "ACTIVE",
//     });

//     res.status(201).json({
//       status: "success",
//       data: {
//         id: newEmployee._id,
//         name: newEmployee.name,
//         email: newEmployee.email,
//         role: newEmployee.role,
//       },
//     });
//   } catch (err) {
//     next(err);
//   }
// }
// /**
//  * @desc    Offboard an employee
//  * @route   PATCH /api/employees/:id/offboard
//  * @access  Admin
//  */
// export async function offboardEmployee(req, res, next) {
//   try {
//     // This calls the specialized service we discussed
//     const result = await processFullOffboard(req.params.id, req.user._id);

//     res.status(200).json({
//       status: "success",
//       data: result,
//     });
//   } catch (err) {
//     next(err);
//   }
// }
import Employee from "../models/Employee.js";
import { processFullOffboard } from "../services/offboardingservice.js";
import AppError from "../utils/appError.js";

/**
 * @desc    Get all employees
 * @route   GET /api/employees
 * @access  Admin
 */
export async function getEmployees(req, res, next) {
  try {
    const employees = await Employee.aggregate([
      {
        $lookup: {
          from: "assets",
          localField: "_id",
          foreignField: "assignedTo",
          as: "assignedAssets",
        },
      },
      {
        $addFields: {
          assignedAssetsCount: { $size: "$assignedAssets" },
        },
      },
      {
        $project: {
          password: 0,
          assignedAssets: 0,
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

/**
 * @desc    Get single employee by ID
 * @route   GET /api/employees/:id
 * @access  Admin
 */
export async function getEmployeeById(req, res, next) {
  try {
    const employee = await Employee.findById(req.params.id).select("-password");
    if (!employee) return next(new AppError("Employee not found", 404));

    res.status(200).json({ status: "success", data: employee });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Create new employee
 * @route   POST /api/employees
 * @access  Admin
 */
export async function createEmployee(req, res, next) {
  try {
    const { name, email, type, password, role, department, level } = req.body;

    // Password complexity validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{10,}$/;
    if (!password || !passwordRegex.test(password)) {
      return next(
        new AppError(
          "Password must be 10 characters long and include: one uppercase, one lowercase, one number, and one special character (!@#$%^&*)",
          400,
        ),
      );
    }

    // Prevent creating ADMIN through this endpoint
    if (role === "ADMIN") {
      return next(
        new AppError("Only one administrator is allowed at this time.", 403),
      );
    }

    // Check for existing email
    const existing = await Employee.findOne({ email });
    if (existing) return next(new AppError("Email already exists", 400));

    // Create employee
    const newEmployee = await Employee.create({
      name,
      email,
      department,
      role,
      level,
      type: type.toUpperCase(),
      password,
      roleAccess: "STAFF", // default role access
      status: "ACTIVE",
    });

    res.status(201).json({
      status: "success",
      data: {
        id: newEmployee._id,
        name: newEmployee.name,
        email: newEmployee.email,
        department: newEmployee.department,
        role: newEmployee.role,
        level: newEmployee.level,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Update employee
 * @route   PATCH /api/employees/:id
 * @access  Admin
 */
export async function updateEmployee(req, res, next) {
  try {
    const { name, email, department, role, level, type, status } = req.body;

    const employee = await Employee.findById(req.params.id);
    if (!employee) return next(new AppError("Employee not found", 404));

    // Prevent updating ADMIN role access accidentally
    if (role === "ADMIN") {
      return next(
        new AppError("Cannot assign ADMIN role through this endpoint", 403),
      );
    }

    employee.name = name || employee.name;
    employee.email = email || employee.email;
    employee.department = department || employee.department;
    employee.role = role || employee.role;
    employee.level = level || employee.level;
    employee.type = type ? type.toUpperCase() : employee.type;
    employee.status = status || employee.status;

    await employee.save();

    res.status(200).json({
      status: "success",
      data: employee,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Delete employee
 * @route   DELETE /api/employees/:id
 * @access  Admin
 */
export async function deleteEmployee(req, res, next) {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return next(new AppError("Employee not found", 404));

    res.status(204).json({ status: "success", data: null });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Offboard an employee
 * @route   PATCH /api/employees/:id/offboard
 * @access  Admin
 */
// export async function offboardEmployee(req, res, next) {
//   try {
//     const result = await processFullOffboard(req.params.id, req.user._id);

//     res.status(200).json({
//       status: "success",
//       data: result,
//     });
//   } catch (err) {
//     next(err);
//   }
// }

export const offboardEmployee = async (req, res) => {
  const { id } = req.params;

  const employee = await Employee.findById(id);
  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }

  const assignedAssets = await Asset.countDocuments({
    assignedTo: id,
    status: { $in: ["ASSIGNED", "REPAIR"] },
  });

  const assignedConsumables = await Consumable.countDocuments({
    assignedTo: id,
    quantity: { $gt: 0 },
  });

  if (assignedAssets > 0 || assignedConsumables > 0) {
    return res.status(400).json({
      message: "Employee still has assigned inventory",
      assets: assignedAssets,
      consumables: assignedConsumables,
    });
  }

  employee.status = "INACTIVE";
  employee.offboardedAt = new Date();
  await employee.save();

  await AuditLog.create({
    action: "OFFBOARDED",
    entityType: "Employee",
    entityId: employee._id,
    performedBy: req.user._id,
    description: `Employee ${employee.name} offboarded`,
  });

  res.json({
    message: "Employee successfully offboarded",
  });
};
