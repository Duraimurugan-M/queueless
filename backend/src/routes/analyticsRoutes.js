const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  getTodayDoctorAnalytics,
  getTodayAnalytics
} = require("../controllers/doctorController");

const {
  getTodayAnalytics: getTodayMDAnalytics
} = require("../controllers/mdController");

// All analytics routes require authentication
router.use(authMiddleware);

// Doctor analytics (DOCTOR role only)
router.get(
  "/doctor/today",
  roleMiddleware(["DOCTOR"]),
  getTodayDoctorAnalytics
);

// MD analytics (MD role only)
router.get(
  "/md/today",
  roleMiddleware(["MD"]),
  getTodayMDAnalytics
);

module.exports = router;
