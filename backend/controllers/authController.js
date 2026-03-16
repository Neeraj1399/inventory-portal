import { promisify } from "util";
import jwt from "jsonwebtoken";
import Employee from "../models/Employee.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import sendEmail from "../utils/email.js";

// --- HELPERS ---

/**
 * @desc Signs a JWT with a specific secret and expiration
 */
const signToken = (id, secret, expires) => {
  return jwt.sign({ id }, secret, { expiresIn: expires });
};

/**
 * @desc Logic to generate tokens, save refresh token to DB, and set secure cookies
 */
const createSendToken = async (user, statusCode, res) => {
  const accessToken = signToken(user._id, process.env.JWT_ACCESS_SECRET, "15m");
  const refreshToken = signToken(
    user._id,
    process.env.JWT_REFRESH_SECRET,
    "7d",
  );

  // Store refresh token in Database for session persistence
  user.refreshToken = refreshToken;
  user.lastLogin = Date.now();

  // Use validateBeforeSave: false to avoid re-triggering required field validation
  // on fields not present in the login/refresh flow.
  await user.save({ validateBeforeSave: false });

  const cookieOptions = {
    httpOnly: true, // Prevents XSS
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax", // Protects against CSRF
  };

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    expires: new Date(Date.now() + 15 * 60 * 1000), // 15 Minutes
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 Days
  });

  // Security: Remove sensitive fields from the JSON response object
  user.password = undefined;
  user.refreshToken = undefined;

  res.status(statusCode).json({
    status: "success",
    accessToken,
    mustChangePassword: user.passwordResetRequired,
    data: { user },
  });
};

// --- AUTH CONTROLLERS ---

/**
 * @desc    Standard Login using Model Methods
 * @route   POST /api/auth/login
 */
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide both email and password.", 400));
  }

  // Find user and explicitly select hidden fields for auth
  const user = await Employee.findOne({ email }).select(
    "+password +roleAccess +passwordResetRequired",
  );

  // Validate credentials and account status
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password.", 401));
  }

  if (user.status === "OFFBOARDED") {
    return next(
      new AppError("This account has been deactivated. Contact IT.", 403),
    );
  }

  await createSendToken(user, 200, res);
});

/**
 * @desc    Exchange a valid Refresh Token for a new Access Token
 * @route   POST /api/auth/refresh
 */
export const refresh = catchAsync(async (req, res, next) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return next(new AppError("Session expired. Please log in again.", 401));
  }

  // Verify the refresh token
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_REFRESH_SECRET,
  );

  // Check if user exists and token matches what is in DB
  const user = await Employee.findById(decoded.id).select("+refreshToken");

  if (!user || user.refreshToken !== token) {
    return next(
      new AppError("Invalid or expired session. Please log in again.", 401),
    );
  }

  const newAccessToken = signToken(
    user._id,
    process.env.JWT_ACCESS_SECRET,
    "15m",
  );

  res.cookie("accessToken", newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    expires: new Date(Date.now() + 15 * 60 * 1000),
  });

  res.status(200).json({
    status: "success",
    accessToken: newAccessToken,
  });
});

/**
 * @desc    Clears session cookies and removes refresh token from DB
 * @route   POST /api/auth/logout
 */
export const logout = catchAsync(async (req, res, next) => {
  if (req.user) {
    await Employee.findByIdAndUpdate(req.user._id, { refreshToken: null });
  }

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  res.status(200).json({
    status: "success",
    message: "Logged out successfully.",
  });
});

/**
 * @desc    Update password with complexity checks and email notification
 * @route   PATCH /api/auth/update-password
 */
export const updatePassword = catchAsync(async (req, res, next) => {
  const { password, passwordConfirm } = req.body;

  // 1. Complexity Validation (10+ chars, Upper, Lower, Number, Special)
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{10,})/;

  if (!passwordRegex.test(password)) {
    return next(
      new AppError(
        "Password must be 10+ characters with uppercase, lowercase, number, and symbol.",
        400,
      ),
    );
  }

  if (password !== passwordConfirm) {
    return next(new AppError("Passwords do not match.", 400));
  }

  // 2. Fetch user and prevent reusing current password
  const user = await Employee.findById(req.user._id).select("+password");

  if (await user.correctPassword(password, user.password)) {
    return next(
      new AppError(
        "New password cannot be the same as your current password.",
        400,
      ),
    );
  }

  // 3. Update fields (Pre-save middleware in Model should handle hashing)
  user.password = password;
  user.passwordResetRequired = false;
  user.refreshToken = null; // Invalidate all existing sessions globally for security

  await user.save();

  // 4. Send Confirmation Email
  try {
    await sendEmail({
      email: user.email,
      subject: "Security Alert: Password Changed Successfully",
      message: `Hello ${user.name},\n\nThis is a confirmation that the password for your Inventory Portal account has been changed.\n\nIf you did not perform this action, please contact the IT Administrator immediately.`,
    });
  } catch (err) {
    console.error("Success email failed to send, but password was modified.");
  }

  // 5. Re-issue tokens so user isn't forced to manually log back in
  await createSendToken(user, 200, res);
});

/**
 * @desc    Get Current Logged-in User
 * @route   GET /api/auth/get-me
 */
export const getMe = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: "success",
    data: { user: req.user },
  });
});
/**
 * @desc    Generate reset token and send via email (Wait for Admin approval now, usually)
 * @route   POST /api/auth/forgot-password
 */
export const forgotPassword = catchAsync(async (req, res, next) => {
  // 1. Get employee based on POSTed email
  const employee = await Employee.findOne({ email: req.body.email });

  // Security: Send success message even if user doesn't exist
  // to prevent account enumeration (guessing valid emails)
  if (!employee) {
    return res.status(200).json({
      status: "success",
      message:
        "If an account exists for that email, a reset link has been sent.",
    });
  }

  // 2. Generate the random reset token
  const resetToken = employee.createPasswordResetToken();
  await employee.save({ validateBeforeSave: false });

  // 3. Send it to employee's email
  try {
    // Construct URL for the frontend
    const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetURL = `${frontendURL}/reset-password/${resetToken}`;

    await sendEmail({
      email: employee.email,
      subject: "Your Password Reset Link (Valid for 10 minutes)",
      message: `We received a request to reset your password. Click this link to proceed: ${resetURL}\n\nIf you did not request this, please ignore this email.`,
    });

    res.status(200).json({
      status: "success",
      message: "Reset link sent to email!",
    });
  } catch (err) {
    employee.passwordResetToken = undefined;
    employee.passwordResetExpires = undefined;
    await employee.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending the email. Try again later.",
        500,
      ),
    );
  }
});

/**
 * @desc    Staff Requests Password Reset from Admin
 * @route   POST /api/auth/forgot-password-request
 */
export const requestPasswordReset = catchAsync(async (req, res, next) => {
  const employee = await Employee.findOne({ email: req.body.email });

  if (employee) {
    employee.resetRequested = true;
    await employee.save({ validateBeforeSave: false });
  }

  // Generic response to avoid enumeration
  res.status(200).json({
    status: "success",
    message: "If an account exists, a reset request has been sent to the IT Administrator.",
  });
});


/**
 * @desc    Verify token from email and update password
 * @route   PATCH /api/auth/reset-password/:token
 */
export const resetPassword = catchAsync(async (req, res, next) => {
  // 1. Get employee based on the hashed version of the token from the URL
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const employee = await Employee.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2. If token is invalid or expired
  if (!employee) {
    return next(new AppError("Token is invalid or has expired.", 400));
  }

  // 3. Update password (pre-save middleware handles hashing)
  employee.password = req.body.password;
  employee.passwordConfirm = req.body.passwordConfirm;
  employee.passwordResetToken = undefined;
  employee.passwordResetExpires = undefined;
  employee.passwordResetRequired = false;

  await employee.save();

  // 4. Log the user in and send new JWTs
  await createSendToken(employee, 200, res);
});
