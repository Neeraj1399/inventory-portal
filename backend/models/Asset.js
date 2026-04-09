import { Schema, model as _model } from "mongoose";

const AssetSchema = new Schema(
  {
    category: {
      type: String,
      required: [true, "Please enter a category (e.g., Laptop, Furniture)"],
      trim: true, // This ensures " Laptop " becomes "Laptop"
    },
    model: {
      type: String,
      required: [true, "Model name is required"],
      trim: true,
    },
    serialNumber: {
      type: String,
      unique: true,
      required: [true, "Serialized assets must have a unique serial number"],
      uppercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ["READY_TO_DEPLOY", "ALLOCATED", "UNDER_MAINTENANCE", "DECOMMISSIONED", "ARCHIVED", "BROKEN"],
        message: "{VALUE} is not a supported status",
      },
      default: "READY_TO_DEPLOY",
    },
    allocatedTo: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    receiptUrl: { type: String },
    purchaseDate: { type: Date },
    purchasePrice: {
      type: Number,
      min: [0, "Price cannot be negative"],
      default: 0,
    },
    warrantyMonths: {
      type: Number,
      default: 12,
    },
    lastMaintenance: { type: Date },
    maintenanceCycle: {
      type: Number,
      default: 6,
    },
    notes: [
      {
        date: { type: Date, default: Date.now },
        text: String,
        createdBy: { type: Schema.Types.ObjectId, ref: "Employee" },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

/**
 * 1. INDEXES
 */
AssetSchema.index({ status: 1 });
AssetSchema.index({ allocatedTo: 1 });
AssetSchema.index({ category: 1 }); // Added index for faster filtering by category

/**
 * 2. DATA INTEGRITY MIDDLEWARE
 */
AssetSchema.pre("save", function () {
  if (this.isModified("status") && this.status !== "ALLOCATED") {
    this.allocatedTo = null;
  }
});

/**
 * 3. VIRTUALS (Asset Age, Warranty, Maintenance)
 */
AssetSchema.virtual("assetAge").get(function () {
  if (!this.purchaseDate) return "N/A";
  try {
    const now = new Date();
    const purchase = new Date(this.purchaseDate);
    if (isNaN(purchase.getTime())) return "Invalid Date";
    let years = now.getFullYear() - purchase.getFullYear();
    let months = now.getMonth() - purchase.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    const yearStr = years > 0 ? `${years}y` : "";
    const monthStr = months > 0 ? `${months}m` : "";
    return years === 0 && months === 0
      ? "New"
      : [yearStr, monthStr].filter(Boolean).join(" ") || "0m";
  } catch (err) {
    return "N/A";
  }
});

AssetSchema.virtual("warrantyStatus").get(function () {
  if (!this.purchaseDate || !this.warrantyMonths) return "No Info";
  try {
    const expiryDate = new Date(this.purchaseDate);
    expiryDate.setMonth(expiryDate.getMonth() + this.warrantyMonths);
    const now = new Date();
    if (now > expiryDate) return "Expired";
    const diffDays = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
    return `${diffDays} days left`;
  } catch (err) {
    return "N/A";
  }
});

AssetSchema.virtual("needsMaintenance").get(function () {
  if (!this.lastMaintenance) return true;
  try {
    const nextDueDate = new Date(this.lastMaintenance);
    nextDueDate.setMonth(nextDueDate.getMonth() + this.maintenanceCycle);
    return new Date() > nextDueDate;
  } catch (err) {
    return false;
  }
});

export default _model("Asset", AssetSchema);
