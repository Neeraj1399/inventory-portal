import { Schema, model } from "mongoose";

const assignmentSchema = new Schema({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity must be at least 1"],
  },
  assignedAt: {
    type: Date,
    default: Date.now,
  },
});

const consumableSchema = new Schema(
  {
    itemName: {
      type: String,
      required: [true, "Item name is required"],
      // unique: true,
      trim: true,
      uppercase: true, // Standardizes "mouse" and "MOUSE"
    },
    // ADD THIS LINE
    category: {
      type: String,
      required: [true, "Category is required"],
    },
    totalQuantity: {
      type: Number,
      required: [true, "Total stock is required"],
      min: [0, "Stock cannot be negative"],
    },
    assignedQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Threshold for low-stock alerts
    lowStockThreshold: {
      type: Number,
      default: 5,
    },
    assignments: [assignmentSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

/**
 * PRO TIP #1: AUTOMATED NORMALIZATION
 * Removing 'next' fixes the TypeError in newer Mongoose versions.
 */
consumableSchema.pre("save", function () {
  if (this.itemName) {
    this.itemName = this.itemName.trim().toUpperCase();
  }
});

/**
 * VIRTUAL: Available Quantity
 */
consumableSchema.virtual("availableQuantity").get(function () {
  return this.totalQuantity - this.assignedQuantity;
});

/**
 * PRO TIP #2: LOW STOCK ALERT VIRTUAL
 */
consumableSchema.virtual("isLowStock").get(function () {
  return this.totalQuantity - this.assignedQuantity <= this.lowStockThreshold;
});

export default model("Consumable", consumableSchema);
