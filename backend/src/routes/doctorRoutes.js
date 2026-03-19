const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const {
  createSchedule,
  getMySchedule,
  getTodayQueue,
  updateTokenStatus
} = require("../controllers/doctorController");

router.use(auth, role(["DOCTOR"]));

router.post("/schedule", createSchedule);
router.get("/schedule", getMySchedule);

router.get("/queue", getTodayQueue);
router.patch("/complete-token/:tokenId", updateTokenStatus);

module.exports = router;
