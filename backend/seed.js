import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Employee from "./models/Employee.js";
import Asset from "./models/Asset.js";
import AuditLog from "./models/AuditLog.js";

dotenv.config();

const seedDB = async () => {
  try {
    const { MONGO_URI } = process.env;
    if (!MONGO_URI) throw new Error("❌ MONGO_URI not found in .env file");

    // 1️⃣ Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("⏳ Connected to MongoDB Atlas");

    // 2️⃣ Drop existing database
    await mongoose.connection.db.dropDatabase();
    console.log("🗑️  Dropped existing database...");

    // 3️⃣ Create Employees
    const salt = await bcrypt.genSalt(10);

    const employeesData = [
      {
        name: "System Admin",
        email: "admin@athiva.com",
        password: await bcrypt.hash("Admin@123", salt),
        role: "Backend Developer",
        level: "Director",
        type: "FULL-TIME",
        status: "ACTIVE",
        department: "IT",
        roleAccess: "ADMIN",
      },
      {
        name: "John Doe",
        email: "john.doe@company.com",
        password: await bcrypt.hash("password123", salt),
        role: "Frontend Developer",
        level: "Mid",
        type: "FULL-TIME",
        status: "ACTIVE",
        department: "IT",
        roleAccess: "STAFF",
      },
    ];

    const createdEmployees = await Employee.insertMany(employeesData);
    const [admin, john] = createdEmployees;
    console.log("👥 Employees created successfully");

    // 4️⃣ Seed Assets
    const assetsData = [
      {
        category: "Laptop",
        model: "MacBook Pro M3 Max",
        serialNumber: "SN-MBP-M3-9901",
        status: "ASSIGNED",
        assignedTo: john._id,
        purchasePrice: 3499,
        purchaseDate: new Date("2024-01-15"),
        warrantyMonths: 36,
        needsMaintenance: false,
        isDeleted: false,
      },
      {
        category: "Laptop",
        model: "MacBook Air M2",
        serialNumber: "SN-MBA-7733",
        status: "AVAILABLE",
        purchasePrice: 1199,
        purchaseDate: new Date("2024-03-01"),
        warrantyMonths: 12,
        needsMaintenance: false,
        isDeleted: false,
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
        needsMaintenance: false,
        isDeleted: false,
      },
      {
        category: "Laptop",
        model: "ThinkPad X1 Carbon",
        serialNumber: "SN-TP-8822",
        status: "REPAIR",
        purchasePrice: 1800,
        purchaseDate: new Date("2023-11-05"),
        warrantyMonths: 12,
        needsMaintenance: true,
        isDeleted: false,
      },
    ];

    const createdAssets = await Asset.insertMany(assetsData);
    console.log("💻 Assets seeded successfully");

    // 5️⃣ Create Audit Logs
    const auditLogsData = [
      {
        action: "ASSIGNED",
        entityType: "Asset",
        entityId: createdAssets[0]._id,
        performedBy: admin._id,
        targetEmployee: john._id,
        description: `Assigned ${createdAssets[0].model} to ${john.name}`,
      },
      {
        action: "ASSIGNED",
        entityType: "Asset",
        entityId: createdAssets[2]._id,
        performedBy: admin._id,
        targetEmployee: john._id,
        description: `Assigned ${createdAssets[2].model} to ${john.name}`,
      },
    ];

    await AuditLog.insertMany(auditLogsData);
    console.log("🧾 Audit logs created successfully");

    // 6️⃣ Update John's assigned asset count
    const johnAssignedCount = createdAssets.filter(
      (asset) =>
        asset.assignedTo && asset.assignedTo.toString() === john._id.toString(),
    ).length;

    await Employee.findByIdAndUpdate(john._id, {
      assignedAssetsCount: johnAssignedCount,
    });

    console.log("------------------------------------------");
    console.log("✅ SEED SUCCESSFUL");
    console.log(`Employees created: ${createdEmployees.length}`);
    console.log(`Assets created: ${createdAssets.length}`);
    console.log(`Assets assigned to John: ${johnAssignedCount}`);
    console.log("------------------------------------------");

    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

// Execute seeding
seedDB();
