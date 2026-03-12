import mongoose from "mongoose";
import User from "./models/User.js"; // Path to your model
import dotenv from "dotenv";
dotenv.config();

const reset = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // Find admin and update password
  // The 'save' hook in your model will hash this automatically
  const admin = await User.findOne({ role: "admin" });
  if (admin) {
    admin.password = "EmergencyReset2026!";
    await admin.save();
    console.log("Admin password reset successfully!");
  }
  process.exit();
};

reset();
