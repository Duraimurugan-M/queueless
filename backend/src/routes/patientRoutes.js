const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const {
  getAvailableSlots,
  bookToken,
  cancelToken,
  getPatientVisitHistory,
  getMyProfile,
  updateMyProfile,
  getPublicDepartments,
  getPublicDoctors,
} = require("../controllers/patientController");

// ── Public data (any authenticated user — patient needs this for booking) ──
router.get("/departments", auth, getPublicDepartments);
router.get("/doctors", auth, getPublicDoctors);

// ── Patient-only routes ────────────────────────────────────────────────────
router.use(auth, role(["PATIENT"]));

router.get("/slots", getAvailableSlots);
router.post("/book-token", bookToken);
router.patch("/cancel-token/:tokenId", cancelToken);
router.get("/visit-history", getPatientVisitHistory);

// Profile
router.get("/profile", getMyProfile);
router.patch("/profile", updateMyProfile);

module.exports = router;
