import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app.js";

// Load Environment Variables
dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Safety check for URI
if (!MONGO_URI) {
  console.error("❌ ERROR: MONGO_URI is not defined in .env file");
  process.exit(1);
}

// Connect to DB
mongoose
  .connect(MONGO_URI) // In Mongoose 6+, you don't need the deprecated options like useNewUrlParser
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");

    app.listen(PORT, () => {
      console.log(
        `🚀 Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
      );
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  });
