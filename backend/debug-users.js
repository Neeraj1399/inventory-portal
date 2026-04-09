import mongoose from "mongoose";
import dotenv from "dotenv";
import Employee from "./models/Employee.js";
import dns from "dns";

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config();

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const users = await Employee.find({}).select("+password +roleAccess +status");
    console.log("Total users found:", users.length);
    
    users.forEach(u => {
      console.log(`- Email: "${u.email}", Role: ${u.roleAccess}, Status: ${u.status}, Name: ${u.name}`);
    });

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};

checkUsers();
