const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema(
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
    visitDate: {
      type: Date,
      default: Date.now
    },
    reason: {
      type: String,
      default: ""
    },
    symptoms: {
      type: String,
      default: ""
    },
    diagnosis: {
      type: String,
      default: ""
    },
    treatment: {
      type: String,
      default: ""
    },
    weight: {
      type: Number,
      default: null
    },
    temperature: {
      type: String,
      default: ""
    },
    vetNotes: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("MedicalRecord", medicalRecordSchema);
