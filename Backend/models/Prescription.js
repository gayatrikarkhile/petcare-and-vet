const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema(
  {
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true
    },
    vetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VetProfile",
      required: true
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null
    },
    medicalRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MedicalRecord",
      default: null
    },
    medicineName: {
      type: String,
      required: true,
      trim: true
    },
    dosage: {
      type: String,
      required: true
    },
    frequency: {
      type: String,
      default: "Once daily"
    },
    duration: {
      type: String,
      default: "7 days"
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      default: null
    },
    instructions: {
      type: String,
      default: ""
    },
    notes: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["Active", "Completed", "Cancelled"],
      default: "Active"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Prescription", prescriptionSchema);
