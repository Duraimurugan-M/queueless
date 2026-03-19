const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String, // "10:00"
    required: true
  },
  endTime: {
    type: String, // "13:00"
    required: true
  },
  breakStart: {
    type: String, // "11:30"
    required: true
  },
  breakEnd: {
    type: String, // "11:45"
    required: true
  },
  slotDuration: {
    type: Number, // minutes
    required: true
  },
  slots: [
    {
      tokenNumber: Number,
      start: String,
      end: String,
      status: {
        type: String,
        enum: ["AVAILABLE", "BOOKED", "CANCELLED", "COMPLETED"],
        default: "AVAILABLE"
      }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Schedule", scheduleSchema);
