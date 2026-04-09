import { Schema, model } from "mongoose";

const requestSchema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    type: {
      type: String,
      enum: ["ALLOCATION", "REPLACEMENT", "SERVICE", "INCIDENT"],
      required: [true, "Request type is required"],
    },
    requestType: {
      type: String,
      enum: ["NEW", "REPLACEMENT"],
      default: "NEW",
    },
    category: {
      type: String,
      enum: ["Laptop", "Monitor", "Mobile", "Headphones", "Keyboard", "Others"],
      default: "Others",
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "FULFILLED"],
      default: "PENDING",
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    itemCategory: {
      type: String,
      enum: ["Asset", "Consumable", null],
      default: null,
    },
    itemId: {
      type: Schema.Types.ObjectId,
      refPath: "itemCategory",
      default: null,
    },
    adminNote: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

/**
 * INDEXES: Optimized for common query patterns
 */
requestSchema.index({ employeeId: 1, status: 1 }); // Staff viewing their own requests filtered by status
requestSchema.index({ status: 1, createdAt: -1 }); // Admin viewing all requests sorted by date

export default model("Request", requestSchema);
