const User = require("../models/User");
const Department = require("../models/Department");
const Doctor = require("../models/Doctor");
const Token = require("../models/Token");
const bcrypt = require("bcryptjs");
const { calculateTokenStats, calculateDetailedStats } = require("../utils/analyticsHelper");

// CREATE DEPARTMENT
exports.createDepartment = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({ message: "Department name is required" });
    }
    const existing = await Department.findOne({ name: name.trim() });
    if (existing) return res.status(409).json({ message: "Department already exists" });

    const count = await Department.countDocuments();
    const deptId = `DEPT-${String(count + 1).padStart(3, "0")}`;
    const department = await Department.create({ name: name.trim(), deptId });
    res.status(201).json({ message: "Department created successfully", department });
  } catch (error) {
    console.error("Create department error:", error);
    res.status(500).json({ message: "Server error creating department" });
  }
};

// GET ALL DEPARTMENTS
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ createdAt: 1 });
    res.json(departments || []);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching departments" });
  }
};

// UPDATE DEPARTMENT
exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: "Department name is required" });

    const existing = await Department.findOne({ name: name.trim(), _id: { $ne: id } });
    if (existing) return res.status(409).json({ message: "Department name already exists" });

    const dept = await Department.findByIdAndUpdate(id, { name: name.trim() }, { new: true });
    if (!dept) return res.status(404).json({ message: "Department not found" });
    res.json({ message: "Department updated", department: dept });
  } catch (error) {
    res.status(500).json({ message: "Server error updating department" });
  }
};

// CREATE DOCTOR — accepts email too
exports.createDoctor = async (req, res) => {
  try {
    const { name, email, mobile, password, departmentId, specialization } = req.body;

    if (!name || !mobile || !password || !departmentId || !specialization) {
      return res.status(400).json({ message: "Name, mobile, password, department, and specialization are required" });
    }

    const existingMobile = await User.findOne({ mobile });
    if (existingMobile) return res.status(409).json({ message: "Mobile already registered" });

    if (email) {
      const existingEmail = await User.findOne({ email: email.toLowerCase() });
      if (existingEmail) return res.status(409).json({ message: "Email already registered" });
    }

    const department = await Department.findById(departmentId);
    if (!department) return res.status(404).json({ message: "Department not found" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      mobile,
      email: email ? email.toLowerCase() : undefined,
      password: hashedPassword,
      role: "DOCTOR",
      department: departmentId,
    });

    const doctor = await Doctor.create({
      user: user._id,
      department: departmentId,
      specialization,
    });

    res.status(201).json({ message: "Doctor created successfully", doctor });
  } catch (error) {
    console.error("Create doctor error:", error);
    res.status(500).json({ message: "Server error creating doctor" });
  }
};

// GET ALL DOCTORS
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate("user", "name mobile email")
      .populate("department", "name deptId");
    res.json(doctors || []);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching doctors" });
  }
};

// UPDATE DOCTOR
exports.updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { specialization, departmentId } = req.body;

    const doctor = await Doctor.findById(id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    if (specialization) doctor.specialization = specialization;
    if (departmentId) {
      const dept = await Department.findById(departmentId);
      if (!dept) return res.status(404).json({ message: "Department not found" });
      doctor.department = departmentId;
      await User.findByIdAndUpdate(doctor.user, { department: departmentId });
    }
    await doctor.save();

    const updated = await Doctor.findById(id)
      .populate("user", "name mobile email")
      .populate("department", "name deptId");
    res.json({ message: "Doctor updated", doctor: updated });
  } catch (error) {
    res.status(500).json({ message: "Server error updating doctor" });
  }
};

// TOGGLE DOCTOR ACTIVE / INACTIVE
exports.toggleDoctorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findById(id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    doctor.isAvailable = !doctor.isAvailable;
    await doctor.save();

    res.json({
      message: `Doctor marked as ${doctor.isAvailable ? "Active" : "Inactive"}`,
      isAvailable: doctor.isAvailable,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error toggling doctor status" });
  }
};

// GET TODAY'S ANALYTICS (MD)
exports.getTodayAnalytics = async (req, res) => {
  try {
    const tokenStats = await calculateTokenStats({});
    const detailedStats = await calculateDetailedStats({});

    const byDepartment = Object.entries(detailedStats.departmentStats || {}).map(([department, total]) => ({
      department, total,
    }));
    const byDoctor = Object.entries(detailedStats.doctorStats || {}).map(([doctor, total]) => ({
      doctor, total, completed: total, pending: 0,
    }));

    res.json({
      message: "Today's analytics fetched successfully",
      data: {
        total: tokenStats.totalPatients,
        completed: tokenStats.completedCount,
        cancelled: tokenStats.cancelledCount,
        pending: tokenStats.pendingCount,
        byDepartment,
        byDoctor,
      },
    });
  } catch (error) {
    console.error("Get MD analytics error:", error);
    res.status(500).json({ message: "Server error fetching MD analytics" });
  }
};
