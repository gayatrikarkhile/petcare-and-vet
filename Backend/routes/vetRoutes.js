const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

const protect = require("../middleware/authMiddleware");
const VetProfile = require("../models/VetProfile");
const User = require("../models/User");
const Appointment = require("../models/Appointment");
const Pet = require("../models/Pet");

// Multer memory storage for verification document uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

function uploadToCloudinary(fileBuffer, folder = "pawsync/vet_docs") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
}

// =========================================================
// GET LOGGED-IN VET PROFILE
// GET /api/vet/profile/me
// =========================================================
router.get("/profile/me", protect, async (req, res) => {
  try {
    let profile = await VetProfile.findOne({ userId: req.user.userId }).populate("userId", "name email phone profilePhoto role");
    if (!profile) {
      // If user is vet but has no profile yet, return user basic details
      const user = await User.findById(req.user.userId).select("-password");
      return res.status(200).json({
        success: true,
        hasProfile: false,
        user
      });
    }
    return res.status(200).json({
      success: true,
      hasProfile: true,
      profile
    });
  } catch (error) {
    console.error("GET VET PROFILE ME ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// =========================================================
// CREATE / UPDATE VET PROFILE
// POST /api/vet/profile
// =========================================================
router.post(
  "/profile",
  protect,
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "verificationDocuments", maxCount: 5 }
  ]),
  async (req, res) => {
    try {
      const userId = req.user.userId;
      const {
        fullName,
        email,
        phone,
        qualification,
        licenseNumber,
        specialization,
        experienceYears,
        clinicName,
        clinicAddress,
        city,
        state,
        pincode,
        clinicPhone,
        consultationFee,
        availableDays,
        startHour,
        endHour,
        slotDuration
      } = req.body;

      if (!licenseNumber) {
        return res.status(400).json({ success: false, message: "Medical/Veterinary Registration Number is required." });
      }

      let documentUrls = [];
      if (req.files && req.files.verificationDocuments) {
        for (const file of req.files.verificationDocuments) {
          const uploaded = await uploadToCloudinary(file.buffer, "pawsync/vet_documents");
          documentUrls.push(uploaded.secure_url);
        }
      }

      let profilePhotoUrl = "";
      if (req.files && req.files.profilePhoto && req.files.profilePhoto.length > 0) {
        const photoUploaded = await uploadToCloudinary(req.files.profilePhoto[0].buffer, "pawsync/vet_photos");
        profilePhotoUrl = photoUploaded.secure_url;
      }

      let parsedAvailableDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      if (availableDays) {
        try {
          parsedAvailableDays = typeof availableDays === "string" ? JSON.parse(availableDays) : availableDays;
        } catch (e) {
          if (typeof availableDays === "string") parsedAvailableDays = availableDays.split(",").map(s => s.trim());
        }
      }

      let profile = await VetProfile.findOne({ userId });

      if (profile) {
        // Update profile & set status back to pending if new docs submitted
        profile.fullName = fullName || profile.fullName;
        profile.email = email || profile.email;
        profile.phone = phone || profile.phone;
        if (profilePhotoUrl) profile.profilePhoto = profilePhotoUrl;
        profile.qualification = qualification || profile.qualification;
        profile.licenseNumber = licenseNumber || profile.licenseNumber;
        profile.specialization = specialization || profile.specialization;
        profile.experienceYears = experienceYears ? Number(experienceYears) : profile.experienceYears;
        profile.clinicName = clinicName || profile.clinicName;
        profile.clinicAddress = clinicAddress || profile.clinicAddress;
        profile.city = city || profile.city;
        profile.state = state || profile.state;
        profile.pincode = pincode || profile.pincode;
        profile.clinicPhone = clinicPhone || profile.clinicPhone;
        profile.consultationFee = consultationFee ? Number(consultationFee) : profile.consultationFee;
        profile.availableDays = parsedAvailableDays;
        if (startHour || endHour) {
          profile.availableHours = {
            start: startHour || profile.availableHours.start,
            end: endHour || profile.availableHours.end
          };
        }
        if (slotDuration) profile.slotDuration = Number(slotDuration);

        if (documentUrls.length > 0) {
          profile.verificationDocuments = [...profile.verificationDocuments, ...documentUrls];
        }

        // Prevent vets from self-approving or modifying status fields
        delete req.body.verificationStatus;
        delete req.body.isVerified;
        delete req.body.verifiedAt;
        delete req.body.verifiedBy;

        if (req.body.resubmitVerification === "true") {
          profile.verificationStatus = "PENDING";
          profile.isVerified = false;
        }

        await profile.save();
      } else {
        // Create new profile - Default to PENDING and unverified
        const user = await User.findById(userId);
        profile = await VetProfile.create({
          userId,
          fullName: fullName || user.name,
          email: email || user.email,
          phone: phone || user.phone || "",
          profilePhoto: profilePhotoUrl || user.profilePhoto || "",
          qualification: qualification || "",
          licenseNumber,
          specialization: specialization || "General Veterinary",
          experienceYears: experienceYears ? Number(experienceYears) : 0,
          clinicName: clinicName || user.clinicName || "",
          clinicAddress: clinicAddress || "",
          city: city || "",
          state: state || "",
          pincode: pincode || "",
          clinicPhone: clinicPhone || "",
          consultationFee: consultationFee ? Number(consultationFee) : 500,
          availableDays: parsedAvailableDays,
          availableHours: { start: startHour || "10:00", end: endHour || "18:00" },
          slotDuration: slotDuration ? Number(slotDuration) : 30,
          verificationDocuments: documentUrls,
          verificationStatus: "PENDING",
          isVerified: false
        });
      }

      return res.status(200).json({
        success: true,
        message: "Profile saved successfully. Verification is pending platform admin review.",
        profile
      });
    } catch (error) {
      console.error("SAVE VET PROFILE ERROR:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
);

// =========================================================
// VET DASHBOARD STATS
// GET /api/vet/stats
// =========================================================
router.get("/stats", protect, async (req, res) => {
  try {
    const profile = await VetProfile.findOne({ userId: req.user.userId });
    if (!profile) {
      return res.status(200).json({
        success: true,
        stats: { todayAppointments: 0, pendingRequests: 0, upcomingAppointments: 0, totalPatients: 0 }
      });
    }

    const todayStr = new Date().toISOString().split("T")[0];

    const todayAppointments = await Appointment.countDocuments({
      vetId: profile._id,
      date: todayStr,
      status: { $in: ["accepted", "pending"] }
    });

    const pendingRequests = await Appointment.countDocuments({
      vetId: profile._id,
      status: "pending"
    });

    const upcomingAppointments = await Appointment.countDocuments({
      vetId: profile._id,
      status: "accepted"
    });

    const uniquePatients = await Appointment.distinct("petId", {
      vetId: profile._id,
      status: { $in: ["accepted", "completed"] }
    });

    return res.status(200).json({
      success: true,
      stats: {
        todayAppointments,
        pendingRequests,
        upcomingAppointments,
        totalPatients: uniquePatients.length
      }
    });
  } catch (error) {
    console.error("VET STATS ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

async function seedDefaultVerifiedVets() {
  try {
    const bcrypt = require("bcryptjs");
    const sampleVetsData = [
      {
        name: "Dr. Anjali Sharma",
        email: "dr.anjali@pawsync.com",
        phone: "+91 9876543210",
        specialization: "General Veterinary",
        qualification: "BVSc & AH, MVSc",
        licenseNumber: "VET-MH-2021-8841",
        experienceYears: 7,
        clinicName: "Paws & Claws Veterinary Clinic",
        clinicAddress: "Koregaon Park, Lane 5",
        city: "Pune",
        state: "Maharashtra",
        consultationFee: 500,
        profilePhoto: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80"
      },
      {
        name: "Dr. Rajesh Kumar",
        email: "dr.rajesh@pawsync.com",
        phone: "+91 9876543211",
        specialization: "Veterinary Surgery",
        qualification: "MVSc (Surgery)",
        licenseNumber: "VET-MH-2018-4412",
        experienceYears: 12,
        clinicName: "PetCare Specialty Surgical Hospital",
        clinicAddress: "Kothrud, Paud Road",
        city: "Pune",
        state: "Maharashtra",
        consultationFee: 800,
        profilePhoto: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80"
      },
      {
        name: "Dr. Priya Patel",
        email: "dr.priya@pawsync.com",
        phone: "+91 9876543212",
        specialization: "Pet Nutrition",
        qualification: "BVSc, Canine Nutrition Specialist",
        licenseNumber: "VET-MH-2020-7739",
        experienceYears: 6,
        clinicName: "Happy Paws Nutrition Clinic",
        clinicAddress: "Viman Nagar, Clover Park",
        city: "Pune",
        state: "Maharashtra",
        consultationFee: 600,
        profilePhoto: "https://images.unsplash.com/photo-1594824813566-8185b378f79d?auto=format&fit=crop&w=400&q=80"
      },
      {
        name: "Dr. Sneha Kulkarni",
        email: "dr.sneha@pawsync.com",
        phone: "+91 9876543213",
        specialization: "Dermatology",
        qualification: "MVSc (Dermatology)",
        licenseNumber: "VET-MH-2019-9102",
        experienceYears: 8,
        clinicName: "Skin & Coat Pet Clinic",
        clinicAddress: "Aundh, IT Park Road",
        city: "Pune",
        state: "Maharashtra",
        consultationFee: 700,
        profilePhoto: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80"
      }
    ];

    const hashedPassword = await bcrypt.hash("Vet@123456", 10);

    for (const vData of sampleVetsData) {
      let user = await User.findOne({ email: vData.email });
      if (!user) {
        user = await User.create({
          name: vData.name,
          email: vData.email,
          phone: vData.phone,
          password: hashedPassword,
          authProvider: "local",
          role: "vet",
          clinicName: vData.clinicName,
          licenseNumber: vData.licenseNumber,
          isEmailVerified: true,
          profilePhoto: vData.profilePhoto
        });
      }

      let vetProf = await VetProfile.findOne({ userId: user._id });
      if (!vetProf) {
        await VetProfile.create({
          userId: user._id,
          fullName: vData.name.replace(/^Dr\.\s*/i, ""),
          email: vData.email,
          phone: vData.phone,
          profilePhoto: vData.profilePhoto,
          qualification: vData.qualification,
          licenseNumber: vData.licenseNumber,
          specialization: vData.specialization,
          experienceYears: vData.experienceYears,
          clinicName: vData.clinicName,
          clinicAddress: vData.clinicAddress,
          city: vData.city,
          state: vData.state,
          consultationFee: vData.consultationFee,
          availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          availableHours: { start: "09:00", end: "18:00" },
          isVerified: true,
          verificationStatus: "APPROVED",
          verifiedAt: new Date()
        });
      } else {
        vetProf.isVerified = true;
        vetProf.verificationStatus = "APPROVED";
        if (!vetProf.verifiedAt) vetProf.verifiedAt = new Date();
        await vetProf.save();
      }
    }
  } catch (err) {
    console.error("SEED DEFAULT VETS ERROR:", err);
  }
}

// =========================================================
// GET PUBLIC VERIFIED VETS (for pet owners)
// GET /api/vet/verified-vets & GET /api/vets
// =========================================================
const getPublicVerifiedVets = async (req, res) => {
  try {
    let verifiedVets = await VetProfile.find({
      $or: [{ verificationStatus: "APPROVED" }, { isVerified: true }]
    })
      .select("-verificationDocuments -rejectionReason")
      .populate("userId", "name email profilePhoto");

    if (!verifiedVets || verifiedVets.length === 0) {
      await seedDefaultVerifiedVets();
      verifiedVets = await VetProfile.find({
        $or: [{ verificationStatus: "APPROVED" }, { isVerified: true }]
      })
        .select("-verificationDocuments -rejectionReason")
        .populate("userId", "name email profilePhoto");
    }

    return res.status(200).json({
      success: true,
      vets: verifiedVets
    });
  } catch (error) {
    console.error("GET VERIFIED VETS ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

router.get("/verified-vets", getPublicVerifiedVets);
router.get("/verified", getPublicVerifiedVets);

// =========================================================
// GET AVAILABLE SLOTS FOR A VET ON A DATE
// GET /api/vet/slots/:vetId?date=YYYY-MM-DD
// =========================================================
router.get("/slots/:vetId", async (req, res) => {
  try {
    const { vetId } = req.params;
    const { date } = req.query;

    const profile = await VetProfile.findById(vetId);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Vet not found." });
    }

    if (!date) {
      return res.status(400).json({ success: false, message: "Date is required." });
    }

    // Generate standard slots between availableHours start and end
    const startStr = profile.availableHours?.start || "10:00";
    const endStr = profile.availableHours?.end || "18:00";
    const duration = profile.slotDuration || 30;

    const parseMinutes = (t) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };

    const formatTimeSlot = (mins) => {
      let h = Math.floor(mins / 60);
      let m = mins % 60;
      const ampm = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
    };

    const startMins = parseMinutes(startStr);
    const endMins = parseMinutes(endStr);

    let allSlots = [];
    for (let cur = startMins; cur + duration <= endMins; cur += duration) {
      allSlots.push(formatTimeSlot(cur));
    }

    // Get already booked appointments on this date
    const bookedAppts = await Appointment.find({
      vetId: profile._id,
      date: date,
      status: { $in: ["pending", "accepted"] }
    }).select("time");

    const bookedTimes = new Set(bookedAppts.map((a) => a.time));

    const slots = allSlots.map((time) => ({
      time,
      available: !bookedTimes.has(time)
    }));

    return res.status(200).json({
      success: true,
      vet: {
        id: profile._id,
        fullName: profile.fullName,
        clinicName: profile.clinicName,
        consultationFee: profile.consultationFee
      },
      date,
      slots
    });
  } catch (error) {
    console.error("GET SLOTS ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// =========================================================
// GET SINGLE VET DETAILS
// GET /api/vet/:id
// =========================================================
router.get("/:id", async (req, res) => {
  try {
    const profile = await VetProfile.findById(req.params.id).select("-verificationDocuments");
    if (!profile) {
      return res.status(404).json({ success: false, message: "Vet profile not found." });
    }
    return res.status(200).json({ success: true, vet: profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
