import dotenv from "dotenv";
import mongoose from "mongoose";

// --- 1. HANDLE UNCAUGHT EXCEPTIONS ---
// This must be at the very top to catch any sync errors in the setup phase
process.on("uncaughtException", (err) => {
  console.error("💥 UNCAUGHT EXCEPTION! Shutting down...");
  console.error(err.name, ":", err.message);
  process.exit(1);
});

// Load Environment Variables
dotenv.config();

// Import app after env vars are loaded
import app from "./app.js";

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ ERROR: MONGO_URI is missing from the .env file.");
  process.exit(1);
}

// --- 2. DATABASE CONNECTION ---
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Database: MongoDB Connection Successful");

    // --- 3. START SERVER ---
    const server = app.listen(PORT, () => {
      console.log(
        `🚀 System: Running in ${process.env.NODE_ENV || "development"} mode`,
      );
      console.log(`📡 Network: Server listening on Port ${PORT}`);
    });

    // --- 4. HANDLE UNHANDLED REJECTIONS ---
    // Catch async promise rejections that aren't handled by catchAsync
    process.on("unhandledRejection", (err) => {
      console.error("💥 UNHANDLED REJECTION! Shutting down gracefully...");
      console.error(err.name, ":", err.message);
      server.close(() => {
        process.exit(1);
      });
    });
  })
  .catch((err) => {
    console.error("❌ Database: Connection Failed ->", err.message);
    process.exit(1);
  });
