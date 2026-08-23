const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const Prescription = require("../models/Prescription");
const VetProfile = require("../models/VetProfile");
const Notification = require("../models/Notification");
const Pet = require("../models/Pet");

router.use(protect);

// =========================================================
// ADD PRESCRIPTION (VET ONLY)
// POST /api/prescriptions
// =========================================================
router.post("/", async (req, res) => {
  try {
    const vetProfile = await VetProfile.findOne({ userId: req.user.userId });
    if (!vetProfile) {
      return res.status(403).json({ success: false, message: "Only registered veterinarians can write prescriptions." });
    }

    const { petId, appointmentId, medicalRecordId, medicineName, dosage, frequency, duration, startDate, endDate, instructions, notes } = req.body;

    if (!petId || !medicineName || !dosage) {
      return res.status(400).json({ success: false, message: "Pet, medicine name, and dosage are required." });
    }

    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ success: false, message: "Pet not found." });
    }

    const prescription = await Prescription.create({
      petId,
      vetId: vetProfile._id,
      appointmentId: appointmentId || null,
      medicalRecordId: medicalRecordId || null,
      medicineName,
      dosage,
      frequency: frequency || "Once daily",
      duration: duration || "7 days",
      startDate: startDate || new Date(),
      endDate: endDate || null,
      instructions: instructions || "",
      notes: notes || "",
      status: "Active"
    });

    if (pet.ownerId) {
      await Notification.create({
        recipientId: pet.ownerId,
        title: "💊 New Prescription Added",
        message: `Dr. ${vetProfile.fullName} prescribed ${medicineName} (${dosage}) for ${pet.petName}.`,
        type: "prescription_added",
        relatedId: prescription._id
      });
    }

    return res.status(201).json({
      success: true,
      message: "Prescription created successfully.",
      prescription
    });
  } catch (error) {
    console.error("ADD PRESCRIPTION ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// =========================================================
// GET ALL PRESCRIPTIONS FOR LOGGED-IN OWNER (GROUPED/FILTERABLE BY PET)
// GET /api/prescriptions/owner
// =========================================================
router.get("/owner", async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const ownerPets = await Pet.find({ ownerId }).select("_id petName species breed petPhoto");
    const petIds = ownerPets.map(p => p._id);

    const prescriptions = await Prescription.find({ petId: { $in: petIds } })
      .sort({ createdAt: -1 })
      .populate("petId", "petName species breed petPhoto")
      .populate("vetId", "fullName clinicName phone specialization clinicAddress");

    return res.status(200).json({
      success: true,
      pets: ownerPets,
      count: prescriptions.length,
      prescriptions
    });
  } catch (error) {
    console.error("GET OWNER PRESCRIPTIONS ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// =========================================================
// GET ALL PRESCRIPTIONS ISSUED BY VET
// GET /api/prescriptions/vet
// =========================================================
router.get("/vet", async (req, res) => {
  try {
    const vetProfile = await VetProfile.findOne({ userId: req.user.userId });
    if (!vetProfile) {
      return res.status(200).json({ success: true, prescriptions: [] });
    }

    const prescriptions = await Prescription.find({ vetId: vetProfile._id })
      .sort({ createdAt: -1 })
      .populate("petId", "petName species breed petPhoto gender ownerId")
      .populate("vetId", "fullName clinicName phone");

    return res.status(200).json({
      success: true,
      count: prescriptions.length,
      prescriptions
    });
  } catch (error) {
    console.error("GET VET PRESCRIPTIONS ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// =========================================================
// GET PRESCRIPTIONS FOR A SPECIFIC PET
// GET /api/prescriptions/pet/:petId
// =========================================================
router.get("/pet/:petId", async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ petId: req.params.petId })
      .sort({ createdAt: -1 })
      .populate("petId", "petName species breed petPhoto")
      .populate("vetId", "fullName clinicName phone specialization clinicAddress");

    return res.status(200).json({
      success: true,
      count: prescriptions.length,
      prescriptions
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// =========================================================
// GET SINGLE PRESCRIPTION DETAILS
// GET /api/prescriptions/:id
// =========================================================
router.get("/:id", async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate("petId", "petName species breed petPhoto gender dateOfBirth currentWeight")
      .populate("vetId", "fullName clinicName phone specialization clinicAddress licenseNumber");

    if (!prescription) {
      return res.status(404).json({ success: false, message: "Prescription not found." });
    }

    return res.status(200).json({ success: true, prescription });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
