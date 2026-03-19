const Doctor = require("../models/Doctor");
const Schedule = require("../models/Schedule");
const generateSlots = require("../utils/generateSlots");
const Token = require("../models/Token");
const { calculateTokenStats } = require("../utils/analyticsHelper");

// CREATE / UPDATE DAILY SCHEDULE
exports.createSchedule = async (req, res) => {
  try {
    const doctorId = req.user?.id;
    if (!doctorId) {
      return res.status(401).json({ message: "Unauthorized: doctor ID missing" });
    }

    const {
      date,
      startTime,
      endTime,
      breakStart,
      breakEnd,
      slotDuration
    } = req.body;

    // INPUT VALIDATION
    if (!date || !startTime || !endTime || !slotDuration || !breakStart || !breakEnd) {
      return res.status(400).json({ message: "All schedule fields are required" });
    }

    const doctor = await Doctor.findOne({ user: doctorId });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    // Check for duplicate schedule
    const dateObj = new Date(date);
    const nextDate = new Date(dateObj);
    nextDate.setDate(nextDate.getDate() + 1);

    const existing = await Schedule.findOne({
      doctor: doctor._id,
      date: { $gte: dateObj, $lt: nextDate }
    });

    if (existing) {
      return res.status(409).json({ message: "Schedule already exists for this date" });
    }

    const slots = generateSlots(
      startTime,
      endTime,
      breakStart,
      breakEnd,
      slotDuration
    );

    if (!slots || slots.length === 0) {
      return res.status(400).json({ message: "Failed to generate slots" });
    }

    const schedule = await Schedule.create({
      doctor: doctor._id,
      date: dateObj,
      startTime,
      endTime,
      breakStart,
      breakEnd,
      slotDuration,
      slots
    });

    if (!schedule) {
      return res.status(500).json({ message: "Failed to create schedule" });
    }

    res.status(201).json({
      message: "Schedule created successfully",
      schedule
    });

  } catch (error) {
    console.error("Create schedule error:", error);
    res.status(500).json({ message: "Server error creating schedule" });
  }
};

// GET SCHEDULE BY DATE
exports.getMySchedule = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { date } = req.query;

    const doctor = await Doctor.findOne({ user: doctorId });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Convert date string to Date object for comparison
    const dateObj = new Date(date);
    const nextDate = new Date(dateObj);
    nextDate.setDate(nextDate.getDate() + 1);

    const schedule = await Schedule.findOne({
      doctor: doctor._id,
      date: { $gte: dateObj, $lt: nextDate }
    });

    res.json(schedule || { message: "No schedule found" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3️⃣ GET TODAY'S QUEUE (last 24 hours)
exports.getTodayQueue = async (req, res) => {
  try {
    const doctorUserId = req.user?.id;
    if (!doctorUserId) {
      return res.status(401).json({ message: "Unauthorized: doctor ID missing" });
    }

    const doctor = await Doctor.findOne({
      user: doctorUserId
    });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    // Rolling 24-hour window
    const end = new Date();
    const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);

    const tokens = await Token.find({
      doctor: doctor._id,
      createdAt: { $gte: start, $lte: end }
    }).sort({ tokenNumber: 1 }).populate("patient", "name mobile");

    if (!tokens) {
      return res.json([]);
    }

    res.json(tokens);

  } catch (error) {
    console.error("Get today queue error:", error);
    res.status(500).json({ message: "Server error fetching queue" });
  }
};

// 4️⃣ MARK TOKEN AS COMPLETED
exports.updateTokenStatus = async (req, res) => {
  try {
    const doctorUserId = req.user?.id;
    if (!doctorUserId) {
      return res.status(401).json({ message: "Unauthorized: doctor ID missing" });
    }

    const { tokenId } = req.params;
    if (!tokenId) {
      return res.status(400).json({ message: "Token ID is required" });
    }

    // Find doctor profile
    const doctor = await Doctor.findOne({ user: doctorUserId });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    // Find token belonging to this doctor
    const token = await Token.findOne({
      _id: tokenId,
      doctor: doctor._id
    });

    if (!token) {
      return res.status(404).json({ message: "Token not found or unauthorized" });
    }

    // Prevent re-completing
    if (token.status === "COMPLETED") {
      return res.status(400).json({ message: "Token already completed" });
    }

    // Update token status
    token.status = "COMPLETED";
    await token.save();

    // Update slot status inside schedule
    const schedule = await Schedule.findById(token.schedule);
    if (schedule) {
      const slot = schedule.slots.id(token.slotId);
      if (slot) {
        slot.status = "COMPLETED";
        await schedule.save();
      }
    }

    res.json({
      message: "Token marked as completed successfully",
      token
    });

  } catch (error) {
    console.error("Update token status error:", error);
    res.status(500).json({ message: "Server error updating token" });
  }
};


// GET TODAY'S DOCTOR ANALYTICS
exports.getTodayDoctorAnalytics = async (req, res) => {
  try {
    const doctorUserId = req.user?.id;
    if (!doctorUserId) {
      return res.status(401).json({ message: "Unauthorized: doctor ID missing" });
    }

    // Get doctor object
    const doctor = await Doctor.findOne({
      user: doctorUserId
    });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    // Calculate analytics using utility
    const stats = await calculateTokenStats({ doctor: doctor._id });

    res.json({
      message: "Doctor analytics fetched successfully",
      data: stats
    });

  } catch (error) {
    console.error("Get doctor analytics error:", error);
    res.status(500).json({
      message: "Server error fetching doctor analytics"
    });
  }
};