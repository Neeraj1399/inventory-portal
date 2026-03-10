import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Employee from "./models/Employee.js";
import Asset from "./models/Asset.js";
import AuditLog from "./models/AuditLog.js";

dotenv.config();

const seedDB = async () => {
  try {
    const URI = process.env.MONGO_URI;
    if (!URI) throw new Error("MONGO_URI not found in .env file");

    await mongoose.connect(URI);
    console.log("⏳ Connected to Atlas. Cleaning database...");

    // Clean existing data
    await Employee.deleteMany({});
    await Asset.deleteMany({});
    await AuditLog.deleteMany({});

    /**
     * 1️⃣ Create Employees
     */

    const salt = await bcrypt.genSalt(10);
    const staffPassword = await bcrypt.hash("password123", salt);
    const adminPassword = await bcrypt.hash("Admin@123", salt);

    const createdEmployees = await Employee.insertMany([
      {
        name: "System Admin",
        email: "admin@athiva.com",
        password: adminPassword,
        role: "ADMIN",
        type: "FULL-TIME",
        status: "ACTIVE",
        department: "IT",
      },
      {
        name: "John Doe",
        email: "john.doe@company.com",
        password: staffPassword,
        role: "STAFF",
        type: "FULL-TIME",
        status: "ACTIVE",
        department: "IT",
      },
    ]);

    const [admin, john] = createdEmployees;

    console.log("👥 Employees created. Seeding High-Value Hardware...");

    /**
     * 2️⃣ Create Hardware Assets
     */

    const assets = await Asset.insertMany([
      {
        category: "Laptop",
        model: "MacBook Pro M3 Max",
        serialNumber: "SN-MBP-M3-9901",
        status: "ASSIGNED",
        assignedTo: john._id,
        purchasePrice: 3499,
        purchaseDate: new Date("2024-01-15"),
        warrantyMonths: 36,
        receiptUrl:
          "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
      },
      {
        category: "Laptop",
        model: "MacBook Air M2",
        serialNumber: "SN-MBA-7733",
        status: "AVAILABLE",
        purchasePrice: 1199,
        purchaseDate: new Date("2024-03-01"),
        warrantyMonths: 12,
        receiptUrl:
          "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
      },
      {
        category: "Monitor",
        model: "Dell UltraSharp 27",
        serialNumber: "SN-DELL-9921",
        status: "ASSIGNED",
        assignedTo: john._id,
        purchasePrice: 450,
        purchaseDate: new Date("2024-02-10"),
        warrantyMonths: 24,
        receiptUrl:
          "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
      },
      {
        category: "Laptop",
        model: "ThinkPad X1 Carbon",
        serialNumber: "SN-TP-8822",
        status: "REPAIR",
        purchasePrice: 1800,
        purchaseDate: new Date("2023-11-05"),
        warrantyMonths: 12,
        receiptUrl:
          "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
      },
    ]);

    console.log("💻 Hardware Assets seeded.");

    /**
     * 3️⃣ Generate Audit Logs
     */

    await AuditLog.insertMany([
      {
        action: "ASSIGNED",
        entityType: "Asset",
        entityId: assets[0]._id,
        performedBy: admin._id,
        targetEmployee: john._id,
        description: `Assigned ${assets[0].model} to ${john.name}`,
      },
      {
        action: "ASSIGNED",
        entityType: "Asset",
        entityId: assets[2]._id,
        performedBy: admin._id,
        targetEmployee: john._id,
        description: `Assigned ${assets[2].model} to ${john.name}`,
      },
    ]);

    console.log("🧾 Audit logs created.");

    /**
     * 4️⃣ Sync Employee Asset Count Automatically
     */

    const assignedCount = assets.filter(
      (asset) =>
        asset.assignedTo && asset.assignedTo.toString() === john._id.toString(),
    ).length;

    await Employee.findByIdAndUpdate(john._id, {
      assignedAssetsCount: assignedCount,
    });

    console.log("------------------------------------------");
    console.log("✅ SEED SUCCESSFUL");
    console.log(`Employees: ${createdEmployees.length}`);
    console.log(`Assets: ${assets.length}`);
    console.log(`Assets assigned to John: ${assignedCount}`);
    console.log("------------------------------------------");

    process.exit();
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seedDB();
