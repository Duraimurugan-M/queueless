const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  timing: {
    type: [String],
    enum: ["MORNING", "AFTERNOON", "EVENING", "NIGHT"],
    required: true
  },
  foodInstruction: {
    type: String,
    enum: ["BEFORE_FOOD", "AFTER_FOOD", "WITH_FOOD"],
    required: true
  },
  sideEffects: {
    type: String,
    required: true,
    trim: true
  }
});

const prescriptionSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true
    },
    token: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Token",
      required: true
    },
    diagnosisNotes: {
      type: String,
      required: true,
      trim: true
    },
    medicines: {
      type: [medicineSchema],
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prescription", prescriptionSchema);