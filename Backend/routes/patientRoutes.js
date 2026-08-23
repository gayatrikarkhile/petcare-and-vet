const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const VetProfile = require("../models/VetProfile");
const Appointment = require("../models/Appointment");
const Pet = require("../models/Pet");
const MedicalRecord = require("../models/MedicalRecord");
const Prescription = require("../models/Prescription");
const Vaccination = require("../models/Vaccination");

router.use(protect);

// =========================================================
// GET ALL UNIQUE PATIENTS FOR VET
// GET /api/patients/vet
// =========================================================
router.get("/vet", async (req, res) => {
  try {
    const vetProfile = await VetProfile.findOne({ userId: req.user.userId });
    if (!vetProfile) {
      return res.status(200).json({ success: true, patients: [] });
    }

    // Find all appointments for this vet
    const appointments = await Appointment.find({
      vetId: vetProfile._id,
      status: { $in: ["accepted", "completed", "pending"] }
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "petId",
        populate: { path: "ownerId", select: "name email phone profilePhoto" }
      });

    // Group unique pets by petId
    const patientMap = new Map();

    for (const appt of appointments) {
      if (!appt.petId) continue;
      const petIdStr = appt.petId._id.toString();

      if (!patientMap.has(petIdStr)) {
        patientMap.set(petIdStr, {
          pet: appt.petId,
          owner: appt.petId.ownerId || appt.ownerId,
          lastVisit: appt.date,
          lastVisitTime: appt.time,
          lastAppointmentStatus: appt.status,
          totalAppointments: 1
        });
      } else {
        const item = patientMap.get(petIdStr);
        item.totalAppointments += 1;
      }
    }

    const patients = Array.from(patientMap.values());

    return res.status(200).json({
      success: true,
      count: patients.length,
      patients
    });
  } catch (error) {
    console.error("GET VET PATIENTS ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// =========================================================
// GET DETAILED SINGLE PATIENT RECORD FOR VET
// GET /api/patients/vet/:petId
// =========================================================
router.get("/vet/:petId", async (req, res) => {
  try {
    const { petId } = req.params;
    const vetProfile = await VetProfile.findOne({ userId: req.user.userId });
    if (!vetProfile) {
      return res.status(403).json({ success: false, message: "Vet profile not found." });
    }

    const pet = await Pet.findById(petId).populate("ownerId", "name email phone profilePhoto");
    if (!pet) {
      return res.status(404).json({ success: false, message: "Patient pet record not found." });
    }

    // Patient Data Authorization Guard: Vet can only access pets associated with them
    const hasAppointment = await Appointment.exists({ petId, vetId: vetProfile._id });
    const hasMedicalRecord = await MedicalRecord.exists({ petId, vetId: vetProfile._id });

    if (!hasAppointment && !hasMedicalRecord) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only access patient medical records for pets associated with your practice."
      });
    }

    const medicalRecords = await MedicalRecord.find({ petId })
      .sort({ visitDate: -1, createdAt: -1 })
      .populate("vetId", "fullName clinicName");

    const prescriptions = await Prescription.find({ petId })
      .sort({ createdAt: -1 })
      .populate("vetId", "fullName clinicName");

    const vaccinations = await Vaccination.find({ petId })
      .sort({ dateGiven: -1, createdAt: -1 });

    const appointments = await Appointment.find({ petId, vetId: vetProfile._id })
      .sort({ date: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      patient: {
        pet,
        owner: pet.ownerId,
        medicalRecords,
        prescriptions,
        vaccinations,
        appointments
      }
    });
  } catch (error) {
    console.error("GET PATIENT DETAIL ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
