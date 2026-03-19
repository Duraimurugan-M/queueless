const Schedule = require("../models/Schedule");
const Doctor = require("../models/Doctor");
const Token = require("../models/Token");
const { sendTokenBookedEmail, sendTokenCancelledEmail } = require("../utils/emailService");
const User = require("../models/User");
const Prescription = require("../models/Prescription");

// 1️⃣ VIEW AVAILABLE SLOTS
exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({ message: "Doctor ID and date are required" });
    }

    // Convert date string to Date object for comparison
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const nextDate = new Date(dateObj);
    nextDate.setDate(nextDate.getDate() + 1);

    const schedule = await Schedule.findOne({
      doctor: doctorId,
      date: { $gte: dateObj, $lt: nextDate }
    });

    if (!schedule) {
      return res.status(404).json({ message: "No schedule found for this date" });
    }

// Return ALL slots so patient sees the full picture (booked shown as unavailable)
    const allSlots = schedule.slots
      .filter(slot => slot.status !== "CANCELLED")  // hide cancelled slots only
      .map(slot => ({
        _id: slot._id,
        start: slot.start,
        end: slot.end,
        status: slot.status,
        tokenNumber: slot.tokenNumber,
        scheduleId: schedule._id,
      }));

    res.json(allSlots);

  } catch (error) {
    console.error("Get available slots error:", error);
    res.status(500).json({ message: "Server error fetching slots" });
  }
};

// 2️⃣ BOOK SLOT
exports.bookToken = async (req, res) => {
  try {
    const patientId = req.user?.id;
    if (!patientId) {
      return res.status(401).json({ message: "Unauthorized: patient ID missing" });
    }

    const {
      scheduleId,
      slotId,
      name,
      age,
      dob,
      reason
    } = req.body;

    if (!scheduleId || !slotId || !name || !age) {
      return res.status(400).json({ message: "Schedule, slot, name, and age are required" });
    }

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    const slot = schedule.slots.id(slotId);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found in schedule" });
    }

    if (slot.status !== "AVAILABLE") {
      return res.status(409).json({ message: "Slot is no longer available" });
    }

    // LOCK SLOT
    slot.status = "BOOKED";
    await schedule.save();

    const token = await Token.create({
      schedule: schedule._id,
      slotId,
      doctor: schedule.doctor,
      patient: patientId,
      patientDetails: { name, age, dob, reason },
      tokenNumber: slot.tokenNumber,
      slotTime: `${slot.start} - ${slot.end}`
    });

    if (!token) {
      return res.status(500).json({ message: "Failed to create token" });
    }

 try {
   // Get full schedule with doctor and department
   const fullSchedule = await Schedule.findById(schedule._id).populate({
     path: "doctor",
     populate: [
       {
         path: "user",
         model: "User",
         select: "name",
       },
       {
         path: "department",
         model: "Department",
         select: "name",
       },
     ],
   });

   const patientUser = await User.findById(req.user.id);

   // Generate a fresh JWT for the PDF link in email (valid 7 days)
   const jwt = require("jsonwebtoken");
   const pdfJwt = jwt.sign(
     { id: patientUser._id, role: "PATIENT" },
     process.env.JWT_SECRET,
     { expiresIn: "7d" }
   );

   await sendTokenBookedEmail(patientUser.email, patientUser.name, {
     tokenNumber: token.tokenNumber,
     slotTime: token.slotTime,
     department: fullSchedule.doctor?.department?.name || "N/A",
     doctor: fullSchedule.doctor?.user?.name || "Doctor",
     tokenId: token._id,
     jwtToken: pdfJwt,
   });
 } catch (err) {
   console.log("Booking email failed:", err.message);
 }

    res.status(201).json({
      message: "Token booked successfully",
      token
    });

  } catch (error) {
    console.error("Book token error:", error);
    res.status(500).json({ message: "Server error booking token" });
  }
};

// 3️⃣ CANCEL TOKEN
exports.cancelToken = async (req, res) => {
  try {
    const patientId = req.user?.id;
    if (!patientId) {
      return res.status(401).json({ message: "Unauthorized: patient ID missing" });
    }

    const { tokenId } = req.params;
    if (!tokenId) {
      return res.status(400).json({ message: "Token ID is required" });
    }

    const token = await Token.findOne({
      _id: tokenId,
      patient: patientId
    });

    if (!token) {
      return res.status(404).json({ message: "Token not found or unauthorized" });
    }

    if (token.status === "CANCELLED") {
      return res.status(400).json({ message: "Token is already cancelled" });
    }

    token.status = "CANCELLED";
    const updatedToken = await token.save();

    if (!updatedToken) {
      return res.status(500).json({ message: "Failed to cancel token" });
    }

    const schedule = await Schedule.findById(token.schedule);
    if (schedule) {
      const slot = schedule.slots.id(token.slotId);
      if (slot) {
        slot.status = "CANCELLED";
        await schedule.save();
      }
    }

    try {
      const patientUser = await User.findById(req.user.id);

      await sendTokenCancelledEmail(
        patientUser.email,
        patientUser.name,
        token.tokenNumber,
      );
    } catch (err) {
      console.log("Cancellation email failed:", err.message);
    }

    res.json({ message: "Token cancelled successfully" });

  } catch (error) {
    console.error("Cancel token error:", error);
    res.status(500).json({ message: "Server error cancelling token" });
  }
};

exports.getPatientVisitHistory = async (req, res) => {
  try {
    const patientId = req.user?.id;
    if (!patientId) {
      return res.status(401).json({ message: "Unauthorized: patient ID missing" });
    }

    const visits = await Token.find({ patient: patientId })
      .sort({ createdAt: -1 })
      .populate({
        path: "doctor",
        populate: [
          {
            path: "user",
            model: "User",
            select: "name"
          },
          {
            path: "department",
            model: "Department",
            select: "name"
          }
        ]
      });

    if (!visits || visits.length === 0) {
      return res.json({
        message: "No visit history found",
        visits: []
      });
    }

    // Batch fetch all prescriptions at once (fixes N+1 query problem)
    const visitIds = visits.map(v => v._id);
    const prescriptions = await Prescription.find({
      token: { $in: visitIds }
    }).select("token _id").lean();

    // Create a map for O(1) lookup
    const prescriptionMap = {};
    prescriptions.forEach(p => {
      prescriptionMap[p.token.toString()] = p._id;
    });

    const visitHistory = visits.map((visit) => ({
      visitId: visit._id,
      tokenNumber: visit.tokenNumber,
      slotTime: visit.slotTime,
      status: visit.status,
      date: visit.createdAt,
      doctor: visit.doctor?.user?.name || "N/A",
      department: visit.doctor?.department?.name || "N/A",
      prescriptionId: prescriptionMap[visit._id.toString()] || null
    }));

    res.json({
      message: "Patient visit history fetched successfully",
      visits: visitHistory
    });

  } catch (error) {
    console.error("Get visit history error:", error);
    res.status(500).json({
      message: "Server error fetching visit history"
    });
  }
};

// ── GET PUBLIC DEPARTMENTS (any authenticated user) ────────────────────────
exports.getPublicDepartments = async (req, res) => {
  try {
    const Department = require("../models/Department");
    const departments = await Department.find().sort({ name: 1 });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching departments" });
  }
};

// ── GET PUBLIC DOCTORS (any authenticated user) ────────────────────────────
exports.getPublicDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isAvailable: true })
      .populate("user", "name mobile")
      .populate("department", "name");
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching doctors" });
  }
};

// ── GET MY PROFILE ────────────────────────────────────────────────────────
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -resetOTP -otpExpiry");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate patient display ID: QL-PT-<padded index>
    // Count how many patients were created before this user
    const patientsBefore = await User.countDocuments({
      role: "PATIENT",
      createdAt: { $lte: user.createdAt },
      _id: { $lte: user._id }
    });
    const displayId = `QL-PT-${String(patientsBefore).padStart(3, "0")}`;

    res.json({
      id: user._id,
      displayId,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      age: user.age,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error fetching profile" });
  }
};

// ── UPDATE MY PROFILE ─────────────────────────────────────────────────────
exports.updateMyProfile = async (req, res) => {
  try {
    const { name, email, age } = req.body;
    const updates = {};

    if (name && name.trim()) updates.name = name.trim();
    if (age && age > 0 && age <= 150) updates.age = parseInt(age);
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      // Check email not taken by another user
      const existing = await User.findOne({ email: email.toLowerCase(), _id: { $ne: req.user.id } });
      if (existing) return res.status(409).json({ message: "Email already in use" });
      updates.email = email.toLowerCase();
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, select: "-password -resetOTP -otpExpiry" }
    );

    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error updating profile" });
  }
};
