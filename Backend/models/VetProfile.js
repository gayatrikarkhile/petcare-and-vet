const mongoose = require("mongoose");

const vetProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    profilePhoto: {
      type: String,
      default: ""
    },

    // Professional Information
    qualification: {
      type: String,
      default: "",
      trim: true
    },
    licenseNumber: {
      type: String,
      required: true,
      trim: true
    },
    specialization: {
      type: String,
      default: "General Veterinary",
      trim: true
    },
    experienceYears: {
      type: Number,
      default: 0
    },

    // Clinic Information
    clinicName: {
      type: String,
      default: "",
      trim: true
    },
    clinicAddress: {
      type: String,
      default: "",
      trim: true
    },
    city: {
      type: String,
      default: "",
      trim: true
    },
    state: {
      type: String,
      default: "",
      trim: true
    },
    pincode: {
      type: String,
      default: "",
      trim: true
    },
    clinicPhone: {
      type: String,
      default: "",
      trim: true
    },
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      addressStr: { type: String, default: "" }
    },

    // Consultation Information
    consultationFee: {
      type: Number,
      default: 500
    },
    availableDays: {
      type: [String],
      default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    },
    availableHours: {
      start: { type: String, default: "10:00" },
      end: { type: String, default: "18:00" }
    },
    slotDuration: {
      type: Number,
      default: 30
    },

    // Verification Information
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING"
    },
    verifiedAt: {
      type: Date,
      default: null
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    verificationDocuments: {
      type: [String],
      default: []
    },
    rejectionReason: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("VetProfile", vetProfileSchema);
