import mongoose from "mongoose";
import dotenv from "dotenv";
import Employee from "./models/Employee.js";
import dns from "dns";
import bcrypt from "bcryptjs";

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config();

const testPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const email = "neerajaravind13@gmail.com";
    const passwordToTest = "Admin@123";

    const user = await Employee.findOne({ email }).select("+password");
    if (!user) {
      console.log("User not found");
      process.exit(1);
    }

    console.log("User found. Hashed password in DB:", user.password);
    
    // Test 1: Using Model method
    const isCorrectModel = await user.correctPassword(passwordToTest, user.password);
    console.log("Test 1 (Model method):", isCorrectModel ? "✅ CORRECT" : "❌ INVALID");

    // Test 2: Using bcrypt directly
    const isCorrectBcrypt = await bcrypt.compare(passwordToTest, user.password);
    console.log("Test 2 (Bcrypt direct):", isCorrectBcrypt ? "✅ CORRECT" : "❌ INVALID");

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};

testPassword();
