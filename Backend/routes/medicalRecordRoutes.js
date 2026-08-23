const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const MedicalRecord = require("../models/MedicalRecord");
const VetProfile = require("../models/VetProfile");
const Notification = require("../models/Notification");
const Pet = require("../models/Pet");

router.use(protect);

// =========================================================
// ADD MEDICAL RECORD
// POST /api/medical-records
// =========================================================
router.post("/", async (req, res) => {
  try {
    const vetProfile = await VetProfile.findOne({ userId: req.user.userId });
    if (!vetProfile) {
      return res.status(403).json({ success: false, message: "Only registered veterinarians can create medical records." });
    }

    const { petId, appointmentId, visitDate, reason, symptoms, diagnosis, treatment, weight, temperature, vetNotes } = req.body;

    if (!petId) {
      return res.status(400).json({ success: false, message: "Pet ID is required." });
    }

    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ success: false, message: "Pet not found." });
    }

    const record = await MedicalRecord.create({
      petId,
      vetId: vetProfile._id,
      appointmentId: appointmentId || null,
      visitDate: visitDate || new Date(),
      reason: reason || "General Checkup",
      symptoms: symptoms || "",
      diagnosis: diagnosis || "",
      treatment: treatment || "",
      weight: weight ? Number(weight) : pet.currentWeight?.value || null,
      temperature: temperature || "",
      vetNotes: vetNotes || ""
    });

    // Notify pet owner
    if (pet.ownerId) {
      await Notification.create({
        recipientId: pet.ownerId,
        title: "📋 New Medical Record Added",
        message: `Dr. ${vetProfile.fullName} added a new consultation medical record for ${pet.petName}.`,
        type: "medical_record_added",
        relatedId: record._id
      });
    }

    return res.status(201).json({
      success: true,
      message: "Medical record saved successfully.",
      record
    });
  } catch (error) {
    console.error("ADD MEDICAL RECORD ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// =========================================================
// GET MEDICAL RECORDS FOR PET
// GET /api/medical-records/pet/:petId
// =========================================================
router.get("/pet/:petId", async (req, res) => {
  try {
    const records = await MedicalRecord.find({ petId: req.params.petId })
      .sort({ visitDate: -1, createdAt: -1 })
      .populate("vetId", "fullName clinicName phone specialization");

    return res.status(200).json({
      success: true,
      records
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
