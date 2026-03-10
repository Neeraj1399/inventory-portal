import { Schema, model as _model } from "mongoose";

const AssetSchema = new Schema(
  {
    category: {
      type: String,
      required: [true, "Category is required (e.g., Laptop)"],
      trim: true,
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
        values: ["AVAILABLE", "ASSIGNED", "REPAIR", "SCRAPPED", "ARCHIVED"],
        message: "{VALUE} is not a supported status",
      },
      default: "AVAILABLE",
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    receiptUrl: { type: String },
    purchaseDate: { type: Date },
    purchasePrice: {
      type: Number,
      min: [0, "Price cannot be negative"],
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
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
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
AssetSchema.index({ assignedTo: 1 });

/**
 * 2. DATA INTEGRITY MIDDLEWARE
 */
AssetSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status !== "ASSIGNED") {
    this.assignedTo = null;
  }
  if (typeof next === "function") {
    next();
  }
});

/**
 * 3. QUERY MIDDLEWARE (Soft Delete)
 */
AssetSchema.pre(/^find/, function (next) {
  // Use 'this.getOptions()' to check for custom flags
  const options = this.getOptions();

  if (!options || !options.includeDeleted) {
    this.where({ isDeleted: { $ne: true } });
  }

  // Ensure next is a function before calling it to prevent the 500 error
  if (typeof next === "function") {
    next();
  }
});
/**
 * 4. VIRTUAL: Asset Age (CRASH-PROOF)
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

/**
 * 5. VIRTUAL: WARRANTY COUNTDOWN (CRASH-PROOF)
 */
AssetSchema.virtual("warrantyStatus").get(function () {
  if (!this.purchaseDate || !this.warrantyMonths) return "No Info";

  try {
    const expiryDate = new Date(this.purchaseDate);
    if (isNaN(expiryDate.getTime())) return "Invalid Date";

    expiryDate.setMonth(expiryDate.getMonth() + this.warrantyMonths);

    const now = new Date();
    if (now > expiryDate) return "Expired";

    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days left`;
  } catch (err) {
    return "N/A";
  }
});

/**
 * 6. VIRTUAL: MAINTENANCE ALERTS
 */
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
