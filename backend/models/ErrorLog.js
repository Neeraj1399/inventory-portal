import { Schema, model } from "mongoose";

const errorLogSchema = new Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
    },
    message: {
      type: String,
      required: true,
    },
    stack: {
      type: String,
    },
    statusCode: {
      type: Number,
      required: true,
    },
    path: {
      type: String,
    },
    method: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
    },
    userAgent: {
      type: String,
    },
    // Useful for grouping similar errors
    errorName: {
      type: String,
    },
  },
  {
    // Auto-expire logs after 30 days to keep the DB lean (Industry standard)
    timestamps: false,
    versionKey: false,
  }
);

// TTL Index: Automatically remove logs older than 30 days
errorLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

export default model("ErrorLog", errorLogSchema);
