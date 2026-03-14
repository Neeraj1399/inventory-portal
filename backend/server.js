// import dotenv from "dotenv";
// import mongoose from "mongoose";
// import app from "./app.js";

// // Load Environment Variables
// dotenv.config();

// const PORT = process.env.PORT || 5000;
// const MONGO_URI = process.env.MONGO_URI;

// // Safety check for URI
// if (!MONGO_URI) {
//   console.error("❌ ERROR: MONGO_URI is not defined in .env file");
//   process.exit(1);
// }

// // Connect to DB
// mongoose
//   .connect(MONGO_URI) // In Mongoose 6+, you don't need the deprecated options like useNewUrlParser
//   .then(() => {
//     console.log("✅ MongoDB Connected Successfully");

//     app.listen(PORT, () => {
//       console.log(
//         `🚀 Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
//       );
//     });
//   })
//   .catch((err) => {
//     console.error("❌ Database connection failed:", err.message);
//     process.exit(1);
//   });
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
