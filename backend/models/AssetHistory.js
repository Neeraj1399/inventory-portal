import mongoose from "mongoose";

const assetHistorySchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
    },

    action: {
      type: String,
      enum: [
        "CREATED",
        "ASSIGNED",
        "RETURNED",
        "REPAIR_STARTED",
        "REPAIR_COMPLETED",
        "SCRAPPED",
        "EDITED",
      ],
      required: true,
    },

    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },

    notes: String,
  },
  { timestamps: true },
);

export default mongoose.model("AssetHistory", assetHistorySchema);
