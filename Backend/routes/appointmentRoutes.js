const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const Appointment = require("../models/Appointment");
const VetProfile = require("../models/VetProfile");
const Pet = require("../models/Pet");
const User = require("../models/User");
const Notification = require("../models/Notification");

// All routes require protection
router.use(protect);

// =========================================================
// OWNER BOOKS APPOINTMENT
// POST /api/appointments
// =========================================================
router.post("/", async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const { vetId, petId, appointmentType, date, time, reason, notes } = req.body;

    if (!vetId || !petId || !date || !time) {
      return res.status(400).json({
        success: false,
        message: "Veterinarian, pet, date, and time are required."
      });
    }

    // Verify vet profile exists and is APPROVED by admin
    const vet = await VetProfile.findById(vetId);
    const isApproved = vet && (vet.verificationStatus === "APPROVED" || vet.isVerified === true);

    if (!vet || !isApproved) {
      return res.status(403).json({
        success: false,
        message: "This veterinarian is not verified and cannot accept appointments."
      });
    }

    // Verify pet belongs to logged in user
    const pet = await Pet.findOne({ _id: petId, ownerId });
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "Pet not found or does not belong to you."
      });
    }

    // Check slot availability (no existing pending/accepted appointment at same time)
    const existing = await Appointment.findOne({
      vetId,
      date,
      time,
      status: { $in: ["pending", "accepted"] }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "This time slot is no longer available. Please select another slot."
      });
    }

    const appointment = await Appointment.create({
      ownerId,
      vetId: vet._id,
      petId: pet._id,
      appointmentType: appointmentType || "General Checkup",
      date,
      time,
      reason: reason || "",
      notes: notes || "",
      status: "pending"
    });

    // Notify vet
    const ownerUser = await User.findById(ownerId);
    await Notification.create({
      recipientId: vet.userId,
      title: "🔔 New Appointment Request",
      message: `New request from ${ownerUser ? ownerUser.name : "Pet Owner"} for ${pet.petName} (${pet.species}/${pet.breed}) on ${date} at ${time}. Reason: ${reason || "General Checkup"}.`,
      type: "appointment_request",
      relatedId: appointment._id
    });

    // Notify owner
    await Notification.create({
      recipientId: ownerId,
      title: "📅 Appointment Requested",
      message: `Your appointment request with Dr. ${vet.fullName} for ${pet.petName} on ${date} at ${time} is submitted. Status: Pending Vet Confirmation.`,
      type: "appointment_submitted",
      relatedId: appointment._id
    });

    return res.status(201).json({
      success: true,
      message: "Appointment request sent successfully.",
      appointment
    });
  } catch (error) {
    console.error("BOOK APPOINTMENT ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// =========================================================
// GET OWNER'S APPOINTMENTS
// GET /api/appointments/owner
// =========================================================
router.get("/owner", async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const appointments = await Appointment.find({ ownerId })
      .sort({ createdAt: -1 })
      .populate("vetId", "fullName clinicName clinicAddress city specialization phone profilePhoto consultationFee")
      .populate("petId", "petName species breed petPhoto gender dateOfBirth currentWeight");

    return res.status(200).json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    console.error("GET OWNER APPOINTMENTS ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// =========================================================
// GET VET'S APPOINTMENTS
// GET /api/appointments/vet?status=pending|accepted|completed|cancelled|rejected
// =========================================================
router.get("/vet", async (req, res) => {
  try {
    const vetProfile = await VetProfile.findOne({ userId: req.user.userId });
    if (!vetProfile) {
      return res.status(200).json({ success: true, appointments: [] });
    }

    const { status } = req.query;
    let query = { vetId: vetProfile._id };
    if (status && status !== "all") {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .sort({ createdAt: -1 })
      .populate("ownerId", "name email phone profilePhoto")
      .populate("petId", "petName species breed gender dateOfBirth currentWeight petPhoto medicalConditions");

    return res.status(200).json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    console.error("GET VET APPOINTMENTS ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// =========================================================
// VET ACCEPTS APPOINTMENT
// PUT /api/appointments/:id/accept
// =========================================================
router.put("/:id/accept", async (req, res) => {
  try {
    const vetProfile = await VetProfile.findOne({ userId: req.user.userId });
    if (!vetProfile) {
      return res.status(403).json({ success: false, message: "Vet profile not found." });
    }

    const appointment = await Appointment.findOne({ _id: req.params.id, vetId: vetProfile._id })
      .populate("petId", "petName")
      .populate("ownerId", "name");

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found." });
    }

    appointment.status = "accepted";
    await appointment.save();

    // Send notification to owner
    const petName = appointment.petId ? appointment.petId.petName : "your pet";
    await Notification.create({
      recipientId: appointment.ownerId._id || appointment.ownerId,
      title: "🟢 Appointment Confirmed",
      message: `Dr. ${vetProfile.fullName} has accepted your appointment for ${petName} on ${appointment.date} at ${appointment.time}. Clinic: ${vetProfile.clinicName || "Clinic"}. Please be on time for your appointment.`,
      type: "appointment_accepted",
      relatedId: appointment._id
    });

    return res.status(200).json({
      success: true,
      message: "Appointment accepted successfully.",
      appointment
    });
  } catch (error) {
    console.error("ACCEPT APPOINTMENT ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// =========================================================
// VET REJECTS APPOINTMENT
// PUT /api/appointments/:id/reject
// =========================================================
router.put("/:id/reject", async (req, res) => {
  try {
    const { reason } = req.body;
    const vetProfile = await VetProfile.findOne({ userId: req.user.userId });
    if (!vetProfile) {
      return res.status(403).json({ success: false, message: "Vet profile not found." });
    }

    const appointment = await Appointment.findOne({ _id: req.params.id, vetId: vetProfile._id })
      .populate("petId", "petName");

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found." });
    }

    appointment.status = "rejected";
    appointment.rejectionReason = reason || "Doctor unavailable at requested time.";
    await appointment.save();

    const petName = appointment.petId ? appointment.petId.petName : "your pet";
    await Notification.create({
      recipientId: appointment.ownerId,
      title: "🔴 Appointment Request Rejected",
      message: `Dr. ${vetProfile.fullName} could not accept your appointment request for ${petName} on ${appointment.date} at ${appointment.time}. Reason: ${appointment.rejectionReason}`,
      type: "appointment_rejected",
      relatedId: appointment._id
    });

    return res.status(200).json({
      success: true,
      message: "Appointment rejected.",
      appointment
    });
  } catch (error) {
    console.error("REJECT APPOINTMENT ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// =========================================================
// COMPLETE APPOINTMENT
// PUT /api/appointments/:id/complete
// =========================================================
router.put("/:id/complete", async (req, res) => {
  try {
    const vetProfile = await VetProfile.findOne({ userId: req.user.userId });
    if (!vetProfile) {
      return res.status(403).json({ success: false, message: "Vet profile not found." });
    }

    const appointment = await Appointment.findOne({ _id: req.params.id, vetId: vetProfile._id });
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found." });
    }

    appointment.status = "completed";
    await appointment.save();

    return res.status(200).json({
      success: true,
      message: "Appointment marked as completed.",
      appointment
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// =========================================================
// CANCEL APPOINTMENT
// PUT /api/appointments/:id/cancel
// =========================================================
router.put("/:id/cancel", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found." });
    }

    appointment.status = "cancelled";
    await appointment.save();

    return res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully.",
      appointment
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
