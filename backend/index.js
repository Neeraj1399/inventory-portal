import dotenv from "dotenv";
import mongoose from "mongoose";

// --- 1. HANDLE UNCAUGHT EXCEPTIONS ---
process.on("uncaughtException", (err) => {
  console.error("💥 UNCAUGHT EXCEPTION! Shutting down...");
  console.error(err.name, ":", err.message);
  process.exit(1);
});

// Load Environment Variables
dotenv.config();

// Import app after env vars are loaded
import app from "./app.js";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ ERROR: MONGO_URI is missing.");
  process.exit(1);
}

// --- 2. DATABASE CONNECTION ---
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    console.log("⏳ Database: Attempting to connect...");
    const conn = await mongoose.connect(MONGO_URI, {
      bufferCommands: false, // Turn off buffering so it fails fast if not connected
    });
    isConnected = !!conn.connections[0].readyState;
    console.log("✅ Database: MongoDB Connected");
  } catch (err) {
    console.error("❌ Database: Connection Failed ->", err.message);
    // Don't exit process in serverless, just throw so Vercel can retry
    throw err;
  }
};

// Start connection immediately
connectDB().catch(() => {});

// Middleware to ensure DB is connected before any request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Database connection failed. Please check IP Whitelisting on MongoDB Atlas (Allow 0.0.0.0/0).",
      details: err.message
    });
  }
});

// --- 3. START SERVER (LOCAL DEVELOPMENT ONLY) ---
// Vercel handles the "listening" part. We only do this for local dev.
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`🚀 System: Running locally on Port ${PORT}`);
  });

  // --- 4. HANDLE UNHANDLED REJECTIONS (LOCAL ONLY) ---
  process.on("unhandledRejection", (err) => {
    console.error("💥 UNHANDLED REJECTION! Shutting down gracefully...");
    server.close(() => process.exit(1));
  });
}

// --- 5. EXPORT FOR VERCEL ---
// CRITICAL: Vercel needs this export to find your Express app
export default app;