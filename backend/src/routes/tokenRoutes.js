const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const {
  getTokenById,
  getMyTokens,
  downloadTokenPDF
} = require("../controllers/tokenController");

// PDF route — auth handled inside controller (supports ?token= query param)
// Must be registered BEFORE router.use(auth) so global auth doesn't block it
router.get("/pdf/:tokenId", downloadTokenPDF);

// All other routes require auth header
router.use(auth);
router.get("/my/all", role(["PATIENT"]), getMyTokens);
router.get("/:tokenId", getTokenById);

module.exports = router;
