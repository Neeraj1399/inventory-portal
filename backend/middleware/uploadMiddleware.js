import multer from "multer";
import path from "path";
import AppError from "../utils/appError.js";

// 1. Set storage engine (Temporary local storage before Cloudinary)
const storage = multer.diskStorage({
  // ADD THIS BLOCK 🟢
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

// 2. Filter files (Images and PDFs only)
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        "Invalid file type. Only JPEGs, PNGs, and PDFs are allowed.",
        400,
      ),
      false,
    );
  }
};

export const uploadReceipt = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit
});
