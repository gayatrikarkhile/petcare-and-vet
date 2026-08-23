const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const Notification = require("../models/Notification");
const Appointment = require("../models/Appointment");
const VetProfile = require("../models/VetProfile");

router.use(protect);

const appointmentTypes = [
  "appointment_request",
  "appointment_submitted",
  "appointment_accepted",
  "appointment_confirmed",
  "appointment_rejected",
  "appointment_cancelled",
  "appointment_completed",
  "appointment_reminder",
  "vet_verification"
];

// =========================================================
// GET APPOINTMENT / VET NOTIFICATIONS ONLY
// GET /api/notifications
// =========================================================
router.get("/", async (req, res) => {
  try {
    const userId = req.user.userId;

    // 1. Query stored appointment-type notifications
    let storedNotifications = await Notification.find({
      recipientId: userId,
      type: { $in: appointmentTypes }
    })
      .sort({ createdAt: -1 })
      .limit(50);

    // 2. Synthesize real-time appointment status notifications from Appointments collection
    const userAppointments = await Appointment.find({ ownerId: userId })
      .sort({ updatedAt: -1 })
      .populate("vetId", "fullName clinicName specialization")
      .populate("petId", "petName");

    const synthesizedNotifications = [];
    userAppointments.forEach(appt => {
      const vetName = appt.vetId ? appt.vetId.fullName : "Veterinarian";
      const petName = appt.petId ? appt.petId.petName : "your pet";
      const dateStr = appt.date || "scheduled date";
      const timeStr = appt.time || "scheduled time";

      let notifType = "appointment_submitted";
      let title = "Appointment requested";
      let message = `Your appointment request with Dr. ${vetName} for ${petName} is pending confirmation.`;

      if (appt.status === "accepted") {
        notifType = "appointment_accepted";
        title = "Appointment confirmed";
        message = `Dr. ${vetName} confirmed your appointment for ${petName}. Today • ${timeStr}`;
      } else if (appt.status === "completed") {
        notifType = "appointment_completed";
        title = "Appointment completed";
        message = `Your appointment with Dr. ${vetName} for ${petName} has been completed.`;
      } else if (appt.status === "rejected" || appt.status === "cancelled") {
        notifType = appt.status === "rejected" ? "appointment_rejected" : "appointment_cancelled";
        title = appt.status === "rejected" ? "Appointment rejected" : "Appointment cancelled";
        message = `Your appointment with Dr. ${vetName} for ${petName} was ${appt.status}.`;
      }

      // Check if already in stored notifications
      const exists = storedNotifications.some(
        n => n.relatedId && n.relatedId.toString() === appt._id.toString()
      );

      if (!exists) {
        synthesizedNotifications.push({
          _id: `synth_${appt._id}`,
          recipientId: userId,
          title,
          message,
          type: notifType,
          relatedId: appt._id,
          isRead: false,
          createdAt: appt.updatedAt || appt.createdAt
        });
      }
    });

    const allNotifications = [...storedNotifications, ...synthesizedNotifications].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    const unreadCount = allNotifications.filter(n => !n.isRead).length;

    return res.status(200).json({
      success: true,
      unreadCount,
      notifications: allNotifications
    });
  } catch (error) {
    console.error("GET APPOINTMENT NOTIFICATIONS ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// =========================================================
// MARK NOTIFICATION AS READ
// PUT /api/notifications/:id/read
// =========================================================
router.put("/:id/read", async (req, res) => {
  try {
    if (req.params.id.startsWith("synth_")) {
      return res.status(200).json({ success: true, message: "Synthesized notification marked as read." });
    }

    const notification = await Notification.findOne({
      _id: req.params.id,
      recipientId: req.user.userId
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json({ success: true, notification });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// =========================================================
// MARK ALL AS READ
// PUT /api/notifications/read-all
// =========================================================
router.put("/read-all", async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user.userId, isRead: false },
      { $set: { isRead: true } }
    );

    return res.status(200).json({ success: true, message: "All notifications marked as read." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
