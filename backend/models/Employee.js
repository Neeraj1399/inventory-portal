// import { Schema, model } from "mongoose";
// import bcrypt from "bcryptjs";

// const employeeSchema = new Schema(
//   {
//     name: { type: String, required: true, trim: true },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//     },
//     department: {
//       type: String,
//       required: true,
//       trim: true,
//       enum: ["IT", "Accounts", "HR", "Manager"],
//     },
//     role: {
//       type: String,
//       required: true,
//       trim: true,
//       enum: [
//         "Backend Developer",
//         "Frontend Developer",
//         "Android Developer",
//         "iOS Developer",
//         "Cloud Engineer",
//         "QA",
//         "DevOps",
//         "Team Lead",
//         "Manager",
//         "Director",
//         "Data Analyst",
//       ],
//     },
//     level: {
//       type: String,
//       required: true,
//       enum: [
//         "Intern",
//         "Junior",
//         "Mid",
//         "Senior",
//         "Lead",
//         "Manager",
//         "Director",
//       ],
//       default: "Junior",
//     },
//     type: {
//       type: String,
//       enum: ["FULL-TIME", "PART-TIME", "INTERN", "CONTRACT"],
//       required: true,
//     },
//     status: {
//       type: String,
//       enum: ["ACTIVE", "OFFBOARDED"],
//       default: "ACTIVE",
//     },
//     roleAccess: {
//       type: String,
//       enum: ["ADMIN", "STAFF"],
//       default: "STAFF",
//     },
//     assignedAssetsCount: {
//       type: Number,
//       default: 0,
//     },
//     passwordResetRequired: {
//       type: Boolean,
//       default: true,
//     },
//     password: {
//       type: String,
//       required: true,
//       select: false,
//     },
//     passwordResetToken: {
//       type: String,
//       select: false,
//     },
//     passwordResetExpires: {
//       type: Date,
//       select: false,
//     },
//     // //update: Added to support the Refresh Token Method
//     refreshToken: {
//       type: String,
//       select: false,
//     },
//     passwordChangedAt: Date,
//   },
//   { timestamps: true },
// );

// employeeSchema.pre("save", async function () {
//   if (!this.isModified("password")) return;
//   this.password = await bcrypt.hash(this.password, 12);
//   // //update: Set timestamp for password changes
//   if (!this.isNew) this.passwordChangedAt = Date.now() - 1000;
// });

// employeeSchema.methods.correctPassword = async function (
//   candidatePassword,
//   userPassword,
// ) {
//   return await bcrypt.compare(candidatePassword, userPassword);
// };

// // //update: Check if password was changed after token issued
// employeeSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
//   if (this.passwordChangedAt) {
//     const changedTimestamp = parseInt(
//       this.passwordChangedAt.getTime() / 1000,
//       10,
//     );
//     return JWTTimestamp < changedTimestamp;
//   }
//   return false;
// };

// export default model("Employee", employeeSchema);
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
      enum: ["IT", "Accounts", "HR", "Manager"],
    },
    role: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "Backend Developer",
        "Frontend Developer",
        "Android Developer",
        "iOS Developer",
        "Cloud Engineer",
        "QA",
        "DevOps",
        "Team Lead",
        "Manager",
        "Director",
        "Data Analyst",
      ],
    },
    level: {
      type: String,
      required: true,
      enum: [
        "Intern",
        "Junior",
        "Mid",
        "Senior",
        "Lead",
        "Manager",
        "Director",
      ],
      default: "Junior",
    },
    type: {
      type: String,
      enum: ["FULL-TIME", "PART-TIME", "INTERN", "CONTRACT"],
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
    // For Admin "Forgot Password" Email Links
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    // For Email OTP Verification
    otp: {
      type: String,
      select: false,
    },
    otpExpires: {
      type: Date,
      select: false,
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
 * Generate a 6-digit numeric OTP and set expiry (10 minutes)
 */
employeeSchema.methods.createOTP = function () {
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  this.otp = otpCode;
  this.otpExpires = Date.now() + 10 * 60 * 1000; // 10 Minutes

  return otpCode;
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

export default model("Employee", employeeSchema);
