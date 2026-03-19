const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendOTPEmail, sendWelcomeEmail, sendPasswordResetConfirmation } = require("../utils/emailService");

// ===============================
// REGISTER PATIENT (PUBLIC)
// ===============================
exports.register = async (req, res) => {
  try {
    const { name, mobile, email, password, age } = req.body;

    // INPUT VALIDATION
    if (!name || !mobile || !password || !email) {
      return res
        .status(400)
        .json({ message: "Name, mobile, email, and password are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Validate age for patient (mandatory)
    if (!age || age < 1 || age > 150) {
      return res
        .status(400)
        .json({ message: "Age is required and must be between 1-150" });
    }

    // CHECK: mobile already exists
    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Mobile number already registered" });
    }

    // CHECK: email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // HASH: password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // CREATE: user
    const user = await User.create({
      name,
      mobile,
      email,
      password: hashedPassword,
      age,
      role: "PATIENT", // force role
    });

    if (!user) {
      return res.status(500).json({ message: "Failed to create user" });
    }

    // Send welcome email (non-blocking)
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (err) {
      console.log("Welcome email failed:", err.message);
    }

    res.status(201).json({
      message: "Patient registered successfully",
      userId: user._id,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// ===============================
// LOGIN (ALL ROLES - Mobile OR Email)
// ===============================
exports.login = async (req, res) => {
  try {
    const { mobile, email, password } = req.body;

    // Support both mobile and email login
    if (!mobile && !email) {
      return res.status(400).json({ message: "Mobile or email is required" });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const orQuery = [];
    if (mobile) orQuery.push({ mobile });
    if (email) orQuery.push({ email });

    const user = await User.findOne(orQuery.length ? { $or: orQuery } : {});
    
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      role: user.role
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};


//===========================
// FORGOT PASSWORD
//===========================

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate 6 digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    user.resetOTP = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
    await user.save();

    await sendOTPEmail(email, otp);

    res.json({ message: "OTP sent to email" });

  } catch (error) {
    res.status(500).json({
      message: "Error sending OTP",
      error: error.message
    });
  }
};

//===========================
// RESET PASSWORD
//===========================
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmNewPassword } = req.body;

    // 1️⃣ Check OTP validity
    const user = await User.findOne({
      email,
      resetOTP: otp,
      otpExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // 2️⃣ Validate password fields
    if (!newPassword || !confirmNewPassword) {
      return res.status(400).json({
        message: "New password and confirm password are required"
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        message: "Passwords do not match"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    // 3️⃣ Prevent using same old password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      return res.status(400).json({
        message: "New password cannot be same as old password"
      });
    }

    // 4️⃣ Hash and save new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    user.resetOTP = undefined;
    user.otpExpiry = undefined;

    await user.save();

    // 5️⃣ Send confirmation email (non-blocking)
    try {
      await sendPasswordResetConfirmation(user.email, user.name);
    } catch (err) {
      console.log("Password confirmation email failed:", err.message);
    }

    res.json({ message: "Password reset successfully" });

  } catch (error) {
    res.status(500).json({
      message: "Error resetting password",
      error: error.message
    });
  }
};

