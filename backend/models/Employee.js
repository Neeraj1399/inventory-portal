import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const employeeSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      required: true,
      default: "Junior",
    },
    type: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "OFFBOARDED"],
      default: "ACTIVE",
    },
    roleAccess: {
      type: String,
      enum: ["ADMIN", "STAFF"],
      default: "STAFF",
    },
    assignedAssetsCount: {
      type: Number,
      default: 0,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    // --- AUTH & SECURITY FIELDS ---
    passwordResetRequired: {
      type: Boolean,
      default: true,
    },
    passwordChangedAt: Date,
    refreshToken: {
      type: String,
      select: false,
    },
    resetRequested: {
      type: Boolean,
      default: false,
    },
    // For Admin "Forgot Password" Email Links
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    offboardedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// --- MIDDLEWARE ---

// Hash password and handle passwordChangedAt logic
employeeSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);

  // Update timestamp if the password was modified (and it's not a brand new user)
  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
  }
});

// --- METHODS ---

/**
 * Compare plain text password with hashed DB password
 */
employeeSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

/**
 * Check if user changed password after a JWT was issued
 */
employeeSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

/**
 * Generate a secure hex token for Admin recovery links
 */
employeeSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 Minutes

  return resetToken;
};

/**
 * INDEXES: Optimized for common query patterns
 */
employeeSchema.index({ status: 1 }); // Filtering active/offboarded employees
employeeSchema.index({ roleAccess: 1, status: 1 }); // Admin count checks (last-admin safeguard)

export default model("Employee", employeeSchema);
