// import { Router } from "express";
// const router = Router();
// import { protect, isAdmin } from "../middleware/authMiddleware.js";
// import { uploadReceipt } from "../middleware/uploadMiddleware.js";
// import {
//   getAssets,
//   createAsset,
//   assignAsset,
//   returnAsset,
//   uploadAssetReceipt,
// } from "../controllers/assetController.js";

// // --- MIDDLEWARE LAYER ---
// // Every route below this line requires a logged-in user
// router.use(protect);

// // --- STAFF & ADMIN ---
// router.get("/", getAssets);

// // --- ADMIN ONLY ---
// router.use(isAdmin); // Cleaner way: any route below this requires Admin role

// router.post("/", createAsset);
// router.patch("/:id/assign", assignAsset);
// router.patch("/:id/return", returnAsset);

// /**
//  * RECEIPT UPLOAD
//  * Note: 'uploadReceipt.single("receipt")' parses the file before the controller runs
//  */
// router.patch(
//   "/:id/receipt",
//   uploadReceipt.single("receipt"),
//   uploadAssetReceipt
// );

// export default router;
import { Router } from "express";
const router = Router();
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import { uploadReceipt } from "../middleware/uploadMiddleware.js";
import {
  getAssets,
  getAsset,
  createAsset,
  updateAsset, // <-- Ensure this is imported
  assignAsset,
  returnAsset,
  uploadAssetReceipt,
  completeRepair,
  deleteAsset,
} from "../controllers/assetController.js";

// --- 1. Authenticated Layer ---
router.use(protect);

// STAFF can view assets (their own) and ADMIN can view all
router.get("/", getAssets);
router.get("/:id", getAsset);

// --- 2. Admin Only Layer ---
router.use(isAdmin);

// CREATE: Handles new assets with optional receipt
router.post("/", uploadReceipt.single("receipt"), createAsset);

// UPDATE: This is what your "Edit" pen button calls
// We use .single("receipt") so you can update text AND/OR the image in one go
router.patch("/:id", uploadReceipt.single("receipt"), updateAsset);
router.delete("/:id", deleteAsset);
// ACTION-SPECIFIC UPDATES
router.patch("/:id/assign", assignAsset);
router.patch("/:id/return", returnAsset);
router.patch("/:id/repair-complete", completeRepair);

// LEGACY/SINGLE-PURPOSE RECEIPT UPLOAD
router.patch(
  "/:id/receipt",
  uploadReceipt.single("receipt"),
  uploadAssetReceipt,
);

export default router;
