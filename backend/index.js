import dotenv from "dotenv";

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

// --- 2. START SERVER (LOCAL DEVELOPMENT ONLY) ---
// Vercel handles the "listening" part. We only do this for local dev.
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`🚀 System: Running locally on Port ${PORT}`);
  });

  // --- 3. HANDLE UNHANDLED REJECTIONS (LOCAL ONLY) ---
  process.on("unhandledRejection", (err) => {
    console.error("💥 UNHANDLED REJECTION! Shutting down gracefully...");
    server.close(() => process.exit(1));
  });
}

// --- 4. EXPORT FOR VERCEL ---
// CRITICAL: Vercel needs this export to find your Express app
export default app;