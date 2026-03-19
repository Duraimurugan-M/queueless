const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  createDepartment,
  getDepartments,
  updateDepartment,
  createDoctor,
  getDoctors,
  updateDoctor,
  toggleDoctorStatus,
} = require("../controllers/mdController");

router.use(authMiddleware, roleMiddleware(["MD"]));

router.post("/department", createDepartment);
router.get("/departments", getDepartments);
router.patch("/department/:id", updateDepartment);

router.post("/doctor", createDoctor);
router.get("/doctors", getDoctors);
router.patch("/doctor/:id", updateDoctor);
router.patch("/doctor/:id/toggle-status", toggleDoctorStatus);

module.exports = router;
