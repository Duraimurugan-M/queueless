const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  schedule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Schedule",
    required: true
  },
  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  patientDetails: {
    name: String,
    age: Number,
    dob: String,
    reason: String
  },
  tokenNumber: Number,
  slotTime: String,
  status: {
    type: String,
    enum: ["BOOKED", "CANCELLED", "COMPLETED"],
    default: "BOOKED"
  }
}, { timestamps: true });

module.exports = mongoose.model("Token", tokenSchema);
