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

export default model("Request", requestSchema);
