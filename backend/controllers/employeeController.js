import Employee from "../models/Employee.js";
import { processFullOffboard } from "../services/offboardingservice.js";
import AppError from "../utils/appError.js";
import Asset from "../models/Asset.js";
import Consumable from "../models/Consumable.js";
import AuditLog from "../models/AuditLog.js";

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
        $lookup: {
          from: "consumables",
          let: { empId: "$_id" },
          pipeline: [
            // Flatten the assignments array inside every consumable item
            { $unwind: "$assignments" },
            // Filter only those assigned to this specific employee
            {
              $match: {
                $expr: { $eq: ["$assignments.employeeId", "$$empId"] },
              },
            },
          ],
          as: "personalConsumables",
        },
      },
      {
        $addFields: {
          assignedAssetsCount: { $size: "$assets" },
          // Count the flattened assignment entries found
          assignedConsumablesCount: { $size: "$personalConsumables" },
        },
      },
      {
        $project: {
          password: 0,
          assets: 0,
          personalConsumables: 0,
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
      roleAccess: "STAFF",
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
// export async function updateEmployee(req, res, next) {
//   try {
//     const { name, email, department, role, level, type, status } = req.body;

//     const employee = await Employee.findById(req.params.id);
//     if (!employee) return next(new AppError("Employee not found", 404));

//     // Prevent updating ADMIN role access accidentally
//     if (role === "ADMIN") {
//       return next(
//         new AppError("Cannot assign ADMIN role through this endpoint", 403),
//       );
//     }

//     employee.name = name || employee.name;
//     employee.email = email || employee.email;
//     employee.department = department || employee.department;
//     employee.role = role || employee.role;
//     employee.level = level || employee.level;
//     employee.type = type ? type.toUpperCase() : employee.type;
//     employee.status = status || employee.status;

//     await employee.save();

//     res.status(200).json({
//       status: "success",
//       data: employee,
//     });
//   } catch (err) {
//     next(err);
//   }
// }
/**
 * @desc    Update employee (Admin or Self)
 * @route   PATCH /api/employees/:id
 */
export async function updateEmployee(req, res, next) {
  try {
    const { name, email, department, role, level, type, status } = req.body;
    const employee = await Employee.findById(req.params.id);

    if (!employee) return next(new AppError("Employee not found", 404));

    // SECURITY CHECK:
    // If the person logged in is NOT an admin, they can only update their own ID
    const isSelfUpdate = req.user._id.toString() === req.params.id;
    const isAdmin = req.user.role === "ADMIN";

    if (!isAdmin && !isSelfUpdate) {
      return next(
        new AppError("You do not have permission to update this profile", 403),
      );
    }

    // 1. Basic Info (Always updatable by self or admin)
    employee.name = name || employee.name;
    employee.email = email || employee.email;

    // 2. Restricted Info (Only updatable by ADMIN)
    if (isAdmin) {
      if (role === "ADMIN" && employee.role !== "ADMIN") {
        return next(
          new AppError("Cannot assign ADMIN role through this endpoint", 403),
        );
      }

      employee.department = department || employee.department;
      employee.role = role || employee.role;
      employee.level = level || employee.level;
      employee.type = type ? type.toUpperCase() : employee.type;
      employee.status = status || employee.status;
    }

    await employee.save();

    res.status(200).json({
      status: "success",
      data: {
        _id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        department: employee.department,
      },
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

  res.json({
    message: "Employee successfully offboarded",
  });
};
/**
 * @desc    Promote an employee to ADMIN
 * @route   PATCH /api/employees/:id/promote
 * @access  Admin Only
 */
export async function promoteToAdmin(req, res, next) {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { roleAccess: "ADMIN" },
      { new: true, runValidators: true },
    );

    if (!employee) return next(new AppError("Employee not found", 404));

    res.status(200).json({
      status: "success",
      message: `${employee.name} is now an Admin.`,
      data: employee,
    });
  } catch (err) {
    next(err);
  }
}
