import { Schema, model } from "mongoose";

const auditLogSchema = new Schema(
  {
    action: {
      type: String,
      enum: [
        "CREATED",
        "MODIFIED",
        "DELETED",
        "ALLOCATED",
        "RECOVERED",
        "OFFBOARDED",
        "REPLENISHED",
        "APPROVED",
        "REJECTED",
        "FULFILLED",
        "REQUESTED",
        "READY_TO_DEPLOY",
        "UNDER_MAINTENANCE",
        "DECOMMISSIONED",
        "ARCHIVED",
        "PROFILE_UPDATED",
        "EMPLOYEE_CREATED",
        "ITEM_REQUEST",
        "ISSUE_REPORTED",
        "PASSWORD_RESET_REQUEST",
      ],
      required: true,
    },
    // The type of entity being acted upon
    entityType: {
      type: String,
      enum: ["Asset", "Consumable", "Employee", "Request"],
      required: true,
    },
    // Dynamic Reference: Allows us to populate based on entityType
    entityId: {
      type: Schema.Types.ObjectId,
      refPath: "entityType",
      required: true,
    },
    // WHO did the action
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    // WHO received the asset (if applicable)
    targetEmployee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
    },
    // PRO TIP: Store a snapshot of what changed
    changes: {
      before: { type: Schema.Types.Mixed }, // Snapshot before change
      after: { type: Schema.Types.Mixed }, // Snapshot after change
    },
    // Human-readable description for quick UI display
    description: { type: String },

    timestamp: { type: Date, default: Date.now },
  },
  {
    // Optimization: Logs are read-only and high-volume
    capped: false,
    versionKey: false,
  },
);

/**
 * INDEXES: Critical for fast filtering in Admin Panel
 */
auditLogSchema.index({ entityId: 1 });
auditLogSchema.index({ performedBy: 1 });
auditLogSchema.index({ timestamp: -1 }); // Default sort: Newest first

export default model("AuditLog", auditLogSchema);
