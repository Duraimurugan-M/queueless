// Input validation middleware
module.exports = {
  // Validate patient registration
  validatePatientRegister: (req, res, next) => {
    const { name, mobile, password, age } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters" });
    }

    if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({ message: "Mobile must be 10 digits" });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    if (!age || age < 1 || age > 150) {
      return res.status(400).json({ message: "Age must be between 1-150" });
    }

    next();
  },

  // Validate login
  validateLogin: (req, res, next) => {
    const { mobile, email, password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password required" });
    }

    if (!mobile && !email) {
      return res.status(400).json({ message: "Mobile or email required" });
    }

    next();
  },

  // Validate prescription creation
  validatePrescription: (req, res, next) => {
    const { tokenId, diagnosisNotes, medicines } = req.body;

    if (!tokenId) {
      return res.status(400).json({ message: "Token ID required" });
    }

    if (!diagnosisNotes || diagnosisNotes.trim().length < 5) {
      return res.status(400).json({ message: "Diagnosis notes required (min 5 chars)" });
    }

    if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({ message: "At least one medicine required" });
    }

    for (let med of medicines) {
      if (!med.name || !med.timing || !med.foodInstruction || !med.sideEffects) {
        return res.status(400).json({ 
          message: "Each medicine must have name, timing, foodInstruction, and sideEffects" 
        });
      }
    }

    next();
  },

  // Validate schedule creation
  validateSchedule: (req, res, next) => {
    const { date, startTime, endTime, breakStart, breakEnd, slotDuration, maxTokens } = req.body;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: "Date format must be YYYY-MM-DD" });
    }

    if (!startTime || !endTime || !breakStart || !breakEnd) {
      return res.status(400).json({ message: "All time fields required" });
    }

    if (!slotDuration || slotDuration < 5 || slotDuration > 120) {
      return res.status(400).json({ message: "Slot duration must be 5-120 minutes" });
    }

    if (!maxTokens || maxTokens < 1) {
      return res.status(400).json({ message: "Max tokens must be at least 1" });
    }

    next();
  }
};
