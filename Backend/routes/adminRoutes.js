const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const VetProfile = require("../models/VetProfile");
const User = require("../models/User");
const Pet = require("../models/Pet");
const Notification = require("../models/Notification");

const requireAdmin = protect.requireAdmin || ((req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required"
    });
  }
  next();
});

// Apply protect + requireAdmin to all admin routes
router.use(protect, requireAdmin);

// =========================================================
// GET ADMIN DASHBOARD STATS
// GET /api/admin/stats & /api/admin/dashboard
// =========================================================
const getAdminStatsHandler = async (req, res) => {
  try {
    const totalVets = await VetProfile.countDocuments({});
    const pendingVets = await VetProfile.countDocuments({
      $or: [{ verificationStatus: "PENDING" }, { verificationStatus: "pending" }]
    });
    const approvedVets = await VetProfile.countDocuments({
      $or: [{ verificationStatus: "APPROVED" }, { verificationStatus: "verified" }, { isVerified: true }]
    });
    const rejectedVets = await VetProfile.countDocuments({
      $or: [{ verificationStatus: "REJECTED" }, { verificationStatus: "rejected" }]
    });

    const totalOwners = await User.countDocuments({ role: "owner" });
    const totalUsers = await User.countDocuments({});
    const totalPets = await Pet.countDocuments({});

    const recentRequests = await VetProfile.find({
      $or: [{ verificationStatus: "PENDING" }, { verificationStatus: "pending" }]
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "name email phone profilePhoto createdAt");

    return res.status(200).json({
      success: true,
      stats: {
        totalVets,
        pendingVets,
        approvedVets,
        rejectedVets,
        totalOwners,
        totalUsers,
        totalPets
      },
      recentRequests
    });
  } catch (error) {
    console.error("ADMIN STATS ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

router.get("/stats", getAdminStatsHandler);
router.get("/dashboard", getAdminStatsHandler);

// =========================================================
// GET ALL VET APPLICATIONS FOR REVIEW
// GET /api/admin/vets?status=PENDING|APPROVED|REJECTED|all
// =========================================================
router.get("/vets", async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    if (status && status !== "all") {
      const s = status.toUpperCase();
      if (s === "PENDING") {
        query.$or = [{ verificationStatus: "PENDING" }, { verificationStatus: "pending" }];
      } else if (s === "APPROVED" || s === "VERIFIED") {
        query.$or = [{ verificationStatus: "APPROVED" }, { verificationStatus: "verified" }, { isVerified: true }];
      } else if (s === "REJECTED") {
        query.$or = [{ verificationStatus: "REJECTED" }, { verificationStatus: "rejected" }];
      }
    }

    const vets = await VetProfile.find(query)
      .sort({ createdAt: -1 })
      .populate("userId", "name email phone profilePhoto isEmailVerified createdAt");

    return res.status(200).json({
      success: true,
      count: vets.length,
      vets
    });
  } catch (error) {
    console.error("ADMIN GET VETS ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// =========================================================
// GET SINGLE VET DETAILS WITH DOCUMENTS FOR REVIEW
// GET /api/admin/vets/:id
// =========================================================
router.get("/vets/:id", async (req, res) => {
  try {
    const vet = await VetProfile.findById(req.params.id).populate("userId", "name email phone profilePhoto");
    if (!vet) {
      return res.status(404).json({ success: false, message: "Vet application not found." });
    }
    return res.status(200).json({ success: true, vet });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// =========================================================
// APPROVE VET VERIFICATION
// PUT /api/admin/vets/:id/approve  (or /verify)
// =========================================================
const approveVetHandler = async (req, res) => {
  try {
    const vet = await VetProfile.findById(req.params.id);
    if (!vet) {
      return res.status(404).json({ success: false, message: "Vet application not found." });
    }

    vet.isVerified = true;
    vet.verificationStatus = "APPROVED";
    vet.verifiedAt = new Date();
    vet.verifiedBy = req.user.userId;
    vet.rejectionReason = "";
    await vet.save();

    // Create notification for vet
    await Notification.create({
      recipientId: vet.userId,
      title: "🟢 PawSync Verified!",
      message: "Congratulations! Your veterinary profile and professional credentials have been reviewed and APPROVED by the Platform Admin. You are now PawSync Verified and visible to pet owners.",
      type: "verification_approved"
    });

    return res.status(200).json({
      success: true,
      message: "Veterinarian approved successfully.",
      vet
    });
  } catch (error) {
    console.error("APPROVE VET ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

router.put("/vets/:id/approve", approveVetHandler);
router.put("/vets/:id/verify", approveVetHandler);

// =========================================================
// REJECT VET VERIFICATION
// PUT /api/admin/vets/:id/reject
// =========================================================
router.put("/vets/:id/reject", async (req, res) => {
  try {
    const { reason } = req.body;
    const vet = await VetProfile.findById(req.params.id);
    if (!vet) {
      return res.status(404).json({ success: false, message: "Vet application not found." });
    }

    const rejectionReasonStr = reason && reason.trim() ? reason.trim() : "Submitted registration documents or professional details could not be validated by platform administration.";

    vet.isVerified = false;
    vet.verificationStatus = "REJECTED";
    vet.rejectionReason = rejectionReasonStr;
    await vet.save();

    // Create notification for vet
    await Notification.create({
      recipientId: vet.userId,
      title: "🔴 Verification Request Rejected",
      message: `Your verification request was reviewed and rejected. Reason: ${rejectionReasonStr}. Please update your profile and credentials for re-evaluation.`,
      type: "verification_rejected"
    });

    return res.status(200).json({
      success: true,
      message: "Veterinarian rejected successfully.",
      vet
    });
  } catch (error) {
    console.error("REJECT VET ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// =========================================================
// GET ALL PLATFORM USERS
// GET /api/admin/users
// =========================================================
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// =========================================================
// GET ALL PLATFORM PETS
// GET /api/admin/pets
// =========================================================
router.get("/pets", async (req, res) => {
  try {
    const pets = await Pet.find({}).populate("ownerId", "name email phone profilePhoto").sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: pets.length,
      pets
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
