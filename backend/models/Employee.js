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
//       enum: ["IT", "Accounts", "HR", "Manager"], // simplified departments
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
//       ], // all possible roles
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
//   },
//   { timestamps: true },
// );

// // Hash password before saving
// employeeSchema.pre("save", async function () {
//   if (!this.isModified("password")) return;
//   this.password = await bcrypt.hash(this.password, 12);
// });

// // Password validation method
// employeeSchema.methods.correctPassword = async function (
//   candidatePassword,
//   userPassword,
// ) {
//   return bcrypt.compare(candidatePassword, userPassword);
// };

// export default model("Employee", employeeSchema);
import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";

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
    passwordResetRequired: {
      type: Boolean,
      default: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    // //update: Added to support the Refresh Token Method
    refreshToken: {
      type: String,
      select: false,
    },
    passwordChangedAt: Date,
  },
  { timestamps: true },
);

employeeSchema.pre("save", async function () {
  if (!this.isModified("password")) return ;
  this.password = await bcrypt.hash(this.password, 12);
  // //update: Set timestamp for password changes
  if (!this.isNew) this.passwordChangedAt = Date.now() - 1000;
  
});

employeeSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// //update: Check if password was changed after token issued
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

export default model("Employee", employeeSchema);
