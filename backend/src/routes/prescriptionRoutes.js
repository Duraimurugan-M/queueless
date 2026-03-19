const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const {
  createPrescription,
  downloadPrescriptionPDF
} = require("../controllers/prescriptionController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const ROLES = require("../constants/roles");

// PDF download — registered before global auth, handles both header and ?token= query param
router.get("/:id/pdf", (req, res, next) => {
  const queryToken = req.query.token;
  if (queryToken) {
    try {
      const decoded = jwt.verify(queryToken, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }
  }
  authMiddleware(req, res, next);
}, downloadPrescriptionPDF);

// Create prescription — requires auth + doctor role
router.post(
  "/",
  authMiddleware,
  roleMiddleware([ROLES.DOCTOR]),
  createPrescription
);

module.exports = router;
