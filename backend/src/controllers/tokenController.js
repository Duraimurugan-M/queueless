const Token = require("../models/Token");
const generateTokenPDF = require("../utils/generatePDF");
const Doctor = require("../models/Doctor");
const Department = require("../models/Department");
const jwt = require("jsonwebtoken");

// GET TOKEN BY ID
exports.getTokenById = async (req, res) => {
  try {
    const { tokenId } = req.params;
    const token = await Token.findById(tokenId)
      .populate("doctor")
      .populate("patient", "name mobile");
    if (!token) return res.status(404).json({ message: "Token not found" });
    res.json(token);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET MY TOKENS (Patient)
exports.getMyTokens = async (req, res) => {
  try {
    const patientId = req.user.id;
    const tokens = await Token.find({ patient: patientId }).sort({ createdAt: -1 });
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DOWNLOAD TOKEN PDF
// Supports JWT from Authorization header OR ?token= query param
// (window.open in browser can't set headers, so we allow query param)
exports.downloadTokenPDF = async (req, res) => {
  try {
    // Accept token from query param (browser window.open) or header
    let jwtToken = req.query.token;
    if (!jwtToken) {
      jwtToken = req.headers.authorization?.split(" ")[1];
    }
    if (!jwtToken) {
      return res.status(401).json({ message: "No token provided" });
    }
    // Verify JWT
    try {
      jwt.verify(jwtToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }

    const { tokenId } = req.params;
    const token = await Token.findById(tokenId)
      .populate("doctor")
      .populate("patient");

    if (!token) return res.status(404).json({ message: "Token not found" });

    const doctor = await Doctor.findById(token.doctor)
      .populate("user")
      .populate("department");

    const department = await Department.findById(doctor.department);

    generateTokenPDF(res, token, doctor, department);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
