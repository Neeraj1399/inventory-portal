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
      trim: true,
      uppercase: true,
    },
    category: {
      type: String,
      required: [true, "Asset Classification is required"],
    },
    // 🟢 ADDED: Unit Cost field
    unitCost: {
      type: Number,
      required: [true, "Unit cost is required"],
      default: 0,
      min: [0, "Cost cannot be negative"],
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
    maintenanceQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
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
 * VIRTUAL: Available Quantity
 * Subtracts both allocated and maintenance stock.
 */
consumableSchema.virtual("availableQuantity").get(function () {
  return (
    this.totalQuantity - this.assignedQuantity - (this.maintenanceQuantity || 0)
  );
});

/**
 * VIRTUAL: Total Inventory Value
 * Calculates the dollar value of the total stock for this item.
 */
consumableSchema.virtual("totalValue").get(function () {
  return (this.totalQuantity || 0) * (this.unitCost || 0);
});

/**
 * VIRTUAL: Low Stock Alert
 */
consumableSchema.virtual("isLowStock").get(function () {
  const available =
    this.totalQuantity -
    this.assignedQuantity -
    (this.maintenanceQuantity || 0);
  return available <= this.lowStockThreshold;
});

consumableSchema.pre("save", function () {
  if (this.itemName) {
    this.itemName = this.itemName.trim().toUpperCase();
  }

});

/**
 * INDEXES: Optimized for common query patterns
 */
consumableSchema.index({ "assignments.employeeId": 1 }); // Employee-consumable lookups (offboarding, staff dashboard)

export default model("Consumable", consumableSchema);
