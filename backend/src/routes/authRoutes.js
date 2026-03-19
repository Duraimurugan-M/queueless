const express = require("express");
const router = express.Router();
const { register, login, resetPassword, forgotPassword } = require("../controllers/authController");

// Register patient
router.post("/register", register);

// Login (MD / Doctor / Patient)
router.post("/login", login);

// Forgot password
router.post("/forgot-password", forgotPassword);

// Reset password
router.post("/reset-password", resetPassword);


module.exports = router;
