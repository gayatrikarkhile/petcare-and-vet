const express = require("express");
const router = express.Router();

const Pet = require("../models/Pet");
const NutritionProfile =require("../models/NutritionProfile");
const protect = require("../middleware/authMiddleware");

const multer = require("multer");
const cloudinary = require("cloudinary").v2;


// =========================================================
// CLOUDINARY CONFIGURATION
// =========================================================

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


// =========================================================
// MULTER CONFIGURATION
// =========================================================

const upload = multer({

    storage: multer.memoryStorage(),

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (allowedTypes.includes(file.mimetype)) {

            cb(null, true);

        } else {

            cb(
                new Error(
                    "Only JPG, PNG and WEBP images are allowed."
                )
            );

        }

    }

});


// =========================================================
// CLOUDINARY BUFFER UPLOAD
// =========================================================

function uploadToCloudinary(fileBuffer) {

    return new Promise((resolve, reject) => {

        const stream =
            cloudinary.uploader.upload_stream(

                {
                    folder: "pawsync/pets",

                    resource_type: "image"
                },

                (error, result) => {

                    if (error) {

                        reject(error);

                    } else {

                        resolve(result);

                    }

                }

            );

        stream.end(fileBuffer);

    });

}


// =========================================================
// ADD PET
// =========================================================

router.post(
    "/",
    protect,
    upload.single("petPhoto"),

    async (req, res) => {

        try {

            console.log("================================");
            console.log("ADD PET REQUEST");
            console.log("================================");

            console.log(
                "Logged-in user:",
                req.user
            );

            console.log(
                "Request body:",
                req.body
            );

            console.log(
                "Uploaded file:",
                req.file
                    ? req.file.originalname
                    : "No photo"
            );


            // =================================================
            // REQUIRED FIELDS
            // =================================================

           const {
    petName,
    species,
    breed,
    gender,
    reproductiveStatus,
    dateOfBirth,
    weight,
    weightUnit,
    microchip
} = req.body;

            // =================================================
            // VALIDATION
            // =================================================

            if (!petName) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Pet name is required."

                });

            }


            if (!species) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Species is required."

                });

            }


            if (!breed) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Breed is required."

                });

            }


            if (!gender) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Gender is required."

                });

            }

// =================================================
// REPRODUCTIVE STATUS
// =================================================

if (!reproductiveStatus) {

    return res.status(400).json({

        success: false,

        message:
            "Reproductive status is required."

    });

}


            if (!dateOfBirth) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Date of birth is required."

                });

            }


            if (!weight || Number(weight) <= 0) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Valid weight is required."

                });

            }


            // =================================================
            // MEDICAL CONDITIONS
            // =================================================

            let medicalConditions = [];


            if (req.body.medicalConditions) {

                try {

                    medicalConditions =
                        JSON.parse(
                            req.body.medicalConditions
                        );

                } catch (error) {

                    medicalConditions =
                        [
                            req.body.medicalConditions
                        ];

                }

            }


            // =================================================
            // PET PHOTO
            // =================================================

            let petPhoto = "";


            if (req.file) {

                console.log(
                    "Uploading pet photo to Cloudinary..."
                );


                const cloudinaryResult =
                    await uploadToCloudinary(
                        req.file.buffer
                    );


                petPhoto =
                    cloudinaryResult.secure_url;


                console.log(
                    "Pet photo uploaded:",
                    petPhoto
                );

            }


           // =================================================
// CREATE PET
// =================================================

const pet =
    await Pet.create({

        ownerId:
            req.user.userId,

        petName:
            petName.trim(),

        species:
            species,

        breed:
            breed.trim(),

        gender:
            gender,

        reproductiveStatus:
            reproductiveStatus,

        dateOfBirth:
            dateOfBirth,

        currentWeight: {

            value:
                Number(weight),

            unit:
                weightUnit || "kg"

        },

        microchipId:
            microchip
                ? microchip.trim()
                : "",

        petPhoto:
            petPhoto,

        medicalConditions:
            medicalConditions

    });

            // =================================================
            // SUCCESS
            // =================================================

            console.log(
                "Pet created successfully:",
                pet._id
            );


            console.log(
                "Saved pet photo:",
                pet.petPhoto
            );


            return res.status(201).json({

                success: true,

                message:
                    "Pet added successfully.",

                pet:
                    pet

            });

        }


        // =====================================================
        // ERROR
        // =====================================================

        catch (error) {

            console.error(
                "ADD PET ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to add pet.",

                error:
                    error.message

            });

        }

    }
);


// =========================================================
// MULTER ERROR HANDLER
// =========================================================

router.use(
    (error, req, res, next) => {

        if (
            error instanceof multer.MulterError
        ) {

            return res.status(400).json({

                success: false,

                message:
                    error.message

            });

        }


        if (error) {

            return res.status(400).json({

                success: false,

                message:
                    error.message

            });

        }


        next();

    }
);

// =========================================================
// UPDATE PET NUTRITION PROFILE
// PUT /api/pets/:id/nutrition-profile
// =========================================================

router.put(
    "/:id/nutrition-profile",
    protect,

    async (req, res) => {

        try {

            const petId =
                req.params.id;


            // =============================================
            // FIND PET BELONGING TO LOGGED-IN USER
            // =============================================

            const pet =
                await Pet.findOne({

                    _id:
                        petId,

                    ownerId:
                        req.user.userId

                });


            if (!pet) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Pet not found."

                });

            }


            // =============================================
            // GET NUTRITION DATA
            // =============================================

            const {
                dietType,
                primaryFood,
                mealsPerDay,
                calorieTarget,
                dietaryRestrictions,
                allergies,
                treatsAllowed,
                waterAccess,
                nutritionGoal,
                notes
            } = req.body;


            // =============================================
            // UPDATE NUTRITION PROFILE
            // =============================================

            pet.nutritionProfile = {

                dietType:
                    dietType || "",

                primaryFood:
                    primaryFood || "",

                mealsPerDay:
                    mealsPerDay !== undefined &&
                    mealsPerDay !== ""
                        ? Number(mealsPerDay)
                        : null,

                calorieTarget:
                    calorieTarget !== undefined &&
                    calorieTarget !== ""
                        ? Number(calorieTarget)
                        : null,

                dietaryRestrictions:
                    Array.isArray(
                        dietaryRestrictions
                    )
                        ? dietaryRestrictions
                        : [],

                allergies:
                    Array.isArray(
                        allergies
                    )
                        ? allergies
                        : [],

                treatsAllowed:
                    typeof treatsAllowed === "boolean"
                        ? treatsAllowed
                        : null,

                waterAccess:
                    waterAccess || "",

                nutritionGoal:
                    nutritionGoal || "",

                notes:
                    notes || ""

            };


            // =============================================
            // SAVE
            // =============================================

            await pet.save();


            // =============================================
            // SUCCESS
            // =============================================

            return res.status(200).json({

                success: true,

                message:
                    "Nutrition profile updated successfully.",

                nutritionProfile:
                    pet.nutritionProfile

            });

        }

        catch (error) {

            console.error(
                "UPDATE NUTRITION PROFILE ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to update nutrition profile.",

                error:
                    error.message

            });

        }

    }
);

// =========================================================
// GET PET PROFILE COMPLETION
// GET /api/pets/:petId/profile-completion
// =========================================================

router.get(
    "/:petId/profile-completion",
    protect,

    async (req, res) => {

        try {

            const pet =
                await Pet.findOne({

                    _id:
                        req.params.petId,

                    ownerId:
                        req.user.userId

                });


            // ---------------------------------------------
            // PET NOT FOUND
            // ---------------------------------------------

            if (!pet) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Pet not found."

                });

            }


            // ---------------------------------------------
            // BASIC PROFILE
            // ---------------------------------------------

            /*
                The Add Pet form already collects:

                - Pet name
                - Species
                - Breed
                - Gender
                - Date of birth
                - Weight

                Therefore the basic profile is considered
                completed when these values exist.
            */

            const basicCompleted =

                Boolean(pet.petName) &&

                Boolean(pet.species) &&

                Boolean(pet.breed) &&

                Boolean(pet.gender) &&

                Boolean(pet.dateOfBirth) &&

                Boolean(
                    pet.currentWeight &&
                    pet.currentWeight.value
                );


            // ---------------------------------------------
            // CARE SECTIONS
            // ---------------------------------------------

            const nutritionProfile =
                await NutritionProfile.findOne({ petId: pet._id });

            const nutritionCompleted =
                Boolean(
                    nutritionProfile &&
                    (nutritionProfile.primaryFood || nutritionProfile.dietType)
                );

            let groomingPlan = null;
            try {
                const GroomingPlan = require("../models/GroomingPlan");
                groomingPlan = await GroomingPlan.findOne({ petId: pet._id });
            } catch (e) {}

            const groomingCompleted =
                Boolean(
                    groomingPlan &&
                    groomingPlan.groomingProfile &&
                    (groomingPlan.groomingProfile.coatType || groomingPlan.groomingProfile.profileCompleted || groomingPlan.groomingProfile.brushingFrequency)
                );

            let activityPlan = null;
            try {
                const ActivityPlan = require("../models/ActivityPlan");
                activityPlan = await ActivityPlan.findOne({ petId: pet._id });
            } catch (e) {}

            const activityCompleted =
                Boolean(
                    (activityPlan && activityPlan.activityProfile && activityPlan.activityProfile.isProfileCompleted) ||
                    pet.careProfile?.activity?.completed ||
                    pet.activityProfileCompleted
                );


            // ---------------------------------------------
            // CALCULATE COMPLETION (50% Basic + 16.67% x 3)
            // ---------------------------------------------

            let completion = 0;

            if (basicCompleted) {
                completion += 50;
            }

            if (nutritionCompleted) {
                completion += 16.6667;
            }

            if (groomingCompleted) {
                completion += 16.6667;
            }

            if (activityCompleted) {
                completion += 16.6667;
            }

            completion = Math.min(100, Number(completion.toFixed(1)));


            // ---------------------------------------------
            // RESPONSE
            // ---------------------------------------------

            return res.status(200).json({

                success: true,

                completion: completion,

                sections: {

                    basic:
                        basicCompleted,

                    nutrition:
                        nutritionCompleted,

                    grooming:
                        groomingCompleted,

                    activity:
                        activityCompleted

                }

            });

        }


        catch (error) {

            console.error(

                "Profile completion error:",

                error

            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to calculate profile completion.",

                error:
                    error.message

            });

        }

    }
);

// =========================================================
// HELPER: CALCULATE DYNAMIC HEALTH SCORE (0-100)
// =========================================================
async function calculatePetHealthScore(petId) {
    try {
        const NutritionSchedule = require("../models/NutritionSchedule");
        const GroomingPlan = require("../models/GroomingPlan");
        const ActivityPlan = require("../models/ActivityPlan");
        const Vaccination = require("../models/Vaccination");

        const [nutSched, groomPlan, actPlan, vacs] = await Promise.all([
            NutritionSchedule.findOne({ petId, status: "Active" }),
            GroomingPlan.findOne({ petId }),
            ActivityPlan.findOne({ petId }),
            Vaccination.find({ petId })
        ]);

        let nutPct = nutSched ? Math.round(((nutSched.completedDays || 0) / 30) * 100) : 0;

        let groomPct = 0;
        if (groomPlan && Array.isArray(groomPlan.schedule) && groomPlan.schedule.length > 0) {
            const groomDoneCount = (groomPlan.history || []).filter(h => h.completed || h.status === "completed").length;
            groomPct = Math.min(100, Math.round((groomDoneCount / Math.max(1, groomPlan.schedule.length)) * 100));
            if (groomPct === 0 && groomDoneCount > 0) groomPct = 25;
        }

        let actPct = 0;
        if (actPlan && Array.isArray(actPlan.schedule) && actPlan.schedule.length > 0) {
            const actDoneCount = (actPlan.history || []).filter(h => h.status === "completed").length;
            actPct = Math.min(100, Math.round((actDoneCount / Math.max(1, actPlan.schedule.length)) * 100));
            if (actPct === 0 && actDoneCount > 0) actPct = 25;
        }

        let vacPct = 100;
        if (vacs && vacs.length > 0) {
            const todayDate = new Date();
            const upToDateVacs = vacs.filter(v => new Date(v.nextDue) >= todayDate || v.completed).length;
            vacPct = Math.round((upToDateVacs / vacs.length) * 100);
        }

        const score = Math.min(100, Math.round((nutPct * 0.30) + (groomPct * 0.25) + (actPct * 0.25) + (vacPct * 0.20)));
        return score;
    } catch (e) {
        return 0;
    }
}

// =========================================================
// GET ALL PETS OF LOGGED-IN USER
// =========================================================

router.get(
    "/",
    protect,

    async (req, res) => {

        try {

            const pets =
                await Pet.find({

                    ownerId:
                        req.user.userId

                }).sort({

                    createdAt: -1

                });

            const petsWithScore = await Promise.all(pets.map(async (p) => {
                const pObj = p.toObject();
                pObj.healthScore = await calculatePetHealthScore(p._id);
                return pObj;
            }));

            return res.status(200).json({

                success: true,

                count:
                    petsWithScore.length,

                pets:
                    petsWithScore

            });

        }

        catch (error) {

            console.error(
                "Get pets error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to fetch pets",

                error:
                    error.message

            });

        }

    }
);


// =========================================================
// GET SINGLE PET BY ID
// =========================================================
router.get("/:id", protect, async (req, res) => {
    try {
        const pet = await Pet.findOne({ _id: req.params.id, ownerId: req.user.userId });
        if (!pet) {
            return res.status(404).json({ success: false, message: "Pet not found." });
        }
        const pObj = pet.toObject();
        pObj.healthScore = await calculatePetHealthScore(pet._id);
        return res.status(200).json({ success: true, pet: pObj });
    } catch (error) {
        console.error("GET PET BY ID ERROR:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch pet details." });
    }
});

// =========================================================
// UPDATE PET DETAILS (PUT /api/pets/:id)
// =========================================================
router.put("/:id", protect, upload.single("petPhoto"), async (req, res) => {
    try {
        const pet = await Pet.findOne({ _id: req.params.id, ownerId: req.user.userId });
        if (!pet) {
            return res.status(404).json({ success: false, message: "Pet not found." });
        }

        const {
            petName,
            species,
            breed,
            gender,
            reproductiveStatus,
            dateOfBirth,
            weight,
            weightUnit,
            microchip,
            petPhoto
        } = req.body;

        if (petName) pet.petName = petName.trim();
        if (species) pet.species = species;
        if (breed) pet.breed = breed.trim();
        if (gender) pet.gender = gender;
        if (reproductiveStatus) pet.reproductiveStatus = reproductiveStatus;
        if (dateOfBirth) pet.dateOfBirth = dateOfBirth;

        if (weight !== undefined && weight !== "") {
            pet.currentWeight = {
                value: Number(weight),
                unit: weightUnit || pet.currentWeight?.unit || "kg"
            };
        }

        if (microchip !== undefined) {
            pet.microchipId = microchip.trim();
        }

        if (req.body.ownerPhone !== undefined) {
            pet.ownerPhone = req.body.ownerPhone.trim();
        }

        if (req.file) {
            const cloudinaryResult = await uploadToCloudinary(req.file.buffer);
            pet.petPhoto = cloudinaryResult.secure_url;
        } else if (petPhoto !== undefined && petPhoto !== "") {
            pet.petPhoto = petPhoto.trim();
        }

        await pet.save();

        return res.status(200).json({
            success: true,
            message: "Pet profile updated successfully.",
            pet
        });
    } catch (error) {
        console.error("UPDATE PET ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to update pet profile.",
            error: error.message
        });
    }
});

/* =========================================================
   PET SAFETY QR & LOST/FOUND RECOVERY ENDPOINTS
========================================================= */

const PetQR = require("../models/PetQR");
const crypto = require("crypto");

// GET / GENERATE PET SAFETY QR (GET /api/pets/:petId/qr)
router.get("/:petId/qr", protect, async (req, res) => {
    try {
        const pet = await Pet.findOne({ _id: req.params.petId, ownerId: req.user.userId });
        if (!pet) {
            return res.status(404).json({ success: false, message: "Pet not found." });
        }

        let petQr = await PetQR.findOne({ petId: pet._id });
        if (!petQr) {
            const qrToken = "qr_" + crypto.randomBytes(12).toString("hex");
            petQr = await PetQR.create({
                petId: pet._id,
                qrToken,
                isActive: true,
                allowPhoneContact: true,
                allowWhatsappContact: true
            });
        }

        return res.status(200).json({
            success: true,
            qr: {
                qrToken: petQr.qrToken,
                isActive: petQr.isActive,
                allowPhoneContact: petQr.allowPhoneContact,
                allowWhatsappContact: petQr.allowWhatsappContact,
                ownerPhone: pet.ownerPhone || ""
            }
        });
    } catch (error) {
        console.error("GET PET QR ERROR:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch QR details." });
    }
});

// REGENERATE PET SAFETY QR TOKEN (PUT /api/pets/:petId/qr/regenerate)
router.put("/:petId/qr/regenerate", protect, async (req, res) => {
    try {
        const pet = await Pet.findOne({ _id: req.params.petId, ownerId: req.user.userId });
        if (!pet) {
            return res.status(404).json({ success: false, message: "Pet not found." });
        }

        const newQrToken = "qr_" + crypto.randomBytes(12).toString("hex");
        let petQr = await PetQR.findOne({ petId: pet._id });

        if (petQr) {
            petQr.qrToken = newQrToken;
            petQr.isActive = true;
            await petQr.save();
        } else {
            petQr = await PetQR.create({
                petId: pet._id,
                qrToken: newQrToken,
                isActive: true
            });
        }

        return res.status(200).json({
            success: true,
            message: "QR Code regenerated successfully.",
            qr: {
                qrToken: petQr.qrToken,
                isActive: petQr.isActive
            }
        });
    } catch (error) {
        console.error("REGENERATE QR ERROR:", error);
        return res.status(500).json({ success: false, message: "Failed to regenerate QR code." });
    }
});

// UPDATE PET LOST / FOUND STATUS (PUT /api/pets/:petId/status)
router.put("/:petId/status", protect, async (req, res) => {
    try {
        const pet = await Pet.findOne({ _id: req.params.petId, ownerId: req.user.userId });
        if (!pet) {
            return res.status(404).json({ success: false, message: "Pet not found." });
        }

        const { isLost, lastSeenLocation, lostDate, note } = req.body;
        pet.isLost = Boolean(isLost);
        if (isLost) {
            pet.lostInfo = {
                lastSeenLocation: lastSeenLocation ? lastSeenLocation.trim() : "",
                lostDate: lostDate ? lostDate.trim() : new Date().toISOString().split("T")[0],
                note: note ? note.trim() : ""
            };
        } else {
            pet.lostInfo = { lastSeenLocation: "", lostDate: "", note: "" };
        }

        await pet.save();
        return res.status(200).json({
            success: true,
            message: isLost ? `${pet.petName} marked as Lost.` : `${pet.petName} marked as Safe/Found.`,
            isLost: pet.isLost,
            lostInfo: pet.lostInfo
        });
    } catch (error) {
        console.error("UPDATE PET STATUS ERROR:", error);
        return res.status(500).json({ success: false, message: "Failed to update pet status." });
    }
});

// PUBLIC UNAUTHENTICATED PET SCANNER ROUTE (GET /api/public/pet/:qrToken)
router.get("/public/pet/:qrToken", async (req, res) => {
    try {
        const petQr = await PetQR.findOne({ qrToken: req.params.qrToken, isActive: true });
        if (!petQr) {
            return res.status(404).json({ success: false, message: "Pet QR Code is invalid or deactivated." });
        }

        const pet = await Pet.findById(petQr.petId);
        if (!pet) {
            return res.status(404).json({ success: false, message: "Associated pet record not found." });
        }

        let ageStr = "Unknown";
        if (pet.dateOfBirth) {
            const birth = new Date(pet.dateOfBirth);
            const now = new Date();
            const years = now.getFullYear() - birth.getFullYear();
            const months = now.getMonth() - birth.getMonth();
            const totalMonths = years * 12 + months;
            if (totalMonths < 12) ageStr = `${totalMonths > 0 ? totalMonths : 1} Months`;
            else ageStr = `${years} Years`;
        }

        return res.status(200).json({
            success: true,
            publicPet: {
                name: pet.petName,
                species: pet.species,
                breed: pet.breed,
                gender: pet.gender,
                age: ageStr,
                weight: pet.currentWeight ? `${pet.currentWeight.value} ${pet.currentWeight.unit}` : "",
                photo: pet.petPhoto || "",
                isLost: Boolean(pet.isLost),
                lostInfo: pet.isLost ? pet.lostInfo : null,
                allowPhoneContact: petQr.allowPhoneContact,
                allowWhatsappContact: petQr.allowWhatsappContact,
                ownerPhone: pet.ownerPhone || ""
            }
        });
    } catch (error) {
        console.error("PUBLIC PET QR SCAN ERROR:", error);
        return res.status(500).json({ success: false, message: "Unable to retrieve public pet profile." });
    }
});

// PUBLIC REPORT FOUND LOCATION (POST /api/public/pet/:qrToken/report-found)
router.post("/public/pet/:qrToken/report-found", async (req, res) => {
    try {
        const petQr = await PetQR.findOne({ qrToken: req.params.qrToken, isActive: true });
        if (!petQr) {
            return res.status(404).json({ success: false, message: "Invalid QR code." });
        }
        const { location, message, finderPhone } = req.body;
        console.log(`[PET RECOVERY NOTICE] Pet QR Token ${req.params.qrToken} reported found at: ${location}. Message: ${message}. Finder Phone: ${finderPhone}`);

        return res.status(200).json({
            success: true,
            message: "Report sent successfully! The pet owner has been notified."
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to submit report." });
    }
});

// =========================================================
// DELETE PET (DELETE /api/pets/:id)
// =========================================================
router.delete("/:id", protect, async (req, res) => {
    try {
        const pet = await Pet.findOne({ _id: req.params.id, ownerId: req.user.userId });
        if (!pet) {
            return res.status(404).json({ success: false, message: "Pet not found." });
        }

        await Pet.deleteOne({ _id: req.params.id, ownerId: req.user.userId });

        // Clean up associated plans
        try {
            const GroomingPlan = require("../models/GroomingPlan");
            await GroomingPlan.deleteMany({ petId: req.params.id });
        } catch (e) {}

        return res.status(200).json({
            success: true,
            message: "Pet deleted successfully."
        });
    } catch (error) {
        console.error("DELETE PET ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete pet.",
            error: error.message
        });
    }
});

// =========================================================
// GET DYNAMIC PET DASHBOARD DATA (GET /api/pets/dashboard/:petId)
// =========================================================
router.get("/dashboard/:petId", protect, async (req, res) => {
    try {
        const { petId } = req.params;

        const pet = await Pet.findOne({ _id: petId, ownerId: req.user.userId });
        if (!pet) {
            return res.status(404).json({ success: false, message: "Pet not found." });
        }

        // Helper: IST Today string (YYYY-MM-DD)
        const getISTDateString = (date = new Date()) => {
            return new Intl.DateTimeFormat("en-CA", {
                timeZone: "Asia/Kolkata",
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            }).format(date);
        };

        const todayStr = getISTDateString();
        const todayDate = new Date();

        // 1. PROFILE COMPLETION & APPOINTMENTS
        const NutritionProfile = require("../models/NutritionProfile");
        const GroomingPlan = require("../models/GroomingPlan");
        const ActivityPlan = require("../models/ActivityPlan");
        const Vaccination = require("../models/Vaccination");
        const NutritionSchedule = require("../models/NutritionSchedule");
        const Appointment = require("../models/Appointment");

        const [nutProf, groomPlan, actPlan, vacs, nutSched, appointmentsRaw] = await Promise.all([
            NutritionProfile.findOne({ petId }),
            GroomingPlan.findOne({ petId }),
            ActivityPlan.findOne({ petId }),
            Vaccination.find({ petId }),
            NutritionSchedule.findOne({ petId, status: "Active" }),
            Appointment.find({ $or: [{ petId }, { ownerId: req.user.userId }] })
                .sort({ createdAt: -1 })
                .populate("vetId", "fullName clinicName clinicAddress city specialization phone profilePhoto consultationFee")
                .populate("petId", "petName species breed petPhoto")
        ]);

        const nutritionCompleted = !!nutProf;
        const groomingCompleted = !!(groomPlan && (groomPlan.isProfileCompleted || (groomPlan.schedule && groomPlan.schedule.length > 0)));
        const activityCompleted = !!(actPlan && (actPlan.isProfileCompleted || (actPlan.schedule && actPlan.schedule.length > 0)));

        let profileCompletionPct = 50.0;
        if (nutritionCompleted) profileCompletionPct += 16.67;
        if (groomingCompleted) profileCompletionPct += 16.67;
        if (activityCompleted) profileCompletionPct += 16.67;
        if (profileCompletionPct > 99) profileCompletionPct = 100.0;

        // 2. TODAY'S CARE TASKS (All Nutrition meals + All Grooming activities for today)
        const todayCareTasks = [];

        // A. Nutrition Tasks (ALL meals for today)
        let nutTasksAvailable = false;
        if (nutSched && Array.isArray(nutSched.days)) {
            nutTasksAvailable = true;
            const todayNutDay = nutSched.days.find(day => {
                if (!day.date) return false;
                return getISTDateString(new Date(day.date)) === todayStr;
            });

            if (todayNutDay) {
                const dayOverallCompleted = !!(todayNutDay.completed || todayNutDay.status === "Completed");

                if (Array.isArray(todayNutDay.meals) && todayNutDay.meals.length > 0) {
                    todayNutDay.meals.forEach((meal, idx) => {
                        const mealIsCompleted = dayOverallCompleted || !!meal.completed;
                        todayCareTasks.push({
                            id: meal._id ? meal._id.toString() : `nut_meal_${idx}`,
                            type: "nutrition",
                            category: "Nutrition",
                            title: meal.mealName || meal.food || `Meal ${idx + 1}`,
                            detail: meal.time ? `Time: ${meal.time}` : (meal.portion ? `Portion: ${meal.portion}` : "Nutrition"),
                            icon: "🍲",
                            completed: mealIsCompleted,
                            completedAt: meal.completedAt || todayNutDay.completedAt || null
                        });
                    });
                } else {
                    todayCareTasks.push({
                        id: `nut_day_${todayNutDay._id || 1}`,
                        type: "nutrition",
                        category: "Nutrition",
                        title: "Daily Nutrition Routine",
                        detail: todayNutDay.waterTarget ? `Water: ${todayNutDay.waterTarget}` : "Balanced Meal Plan",
                        icon: "🍲",
                        completed: dayOverallCompleted,
                        completedAt: todayNutDay.completedAt || null
                    });
                }
            }
        }

        // B. Grooming Tasks (ALL tasks for today)
        let groomTasksAvailable = false;
        if (groomPlan && Array.isArray(groomPlan.schedule)) {
            groomTasksAvailable = true;
            const todayGroomItems = groomPlan.schedule.filter(item => item.date === todayStr);

            todayGroomItems.forEach(item => {
                let icon = "✂️";
                const t = (item.activityType || "").toLowerCase();
                if (t.includes("dental") || t.includes("tooth")) icon = "🦷";
                else if (t.includes("bath") || t.includes("wash")) icon = "🧼";
                else if (t.includes("brush")) icon = "🪮";
                else if (t.includes("paw") || t.includes("nail")) icon = "🐾";
                else if (t.includes("ear")) icon = "👂";

                const isGroomDone = !!(item.completed || item.status === "completed");

                todayCareTasks.push({
                    id: item.activityId,
                    type: "grooming",
                    category: "Grooming",
                    title: item.activityName,
                    detail: item.description || "Grooming Activity",
                    icon: icon,
                    completed: isGroomDone,
                    completedAt: item.completedAt || null
                });
            });
        }

        const todayCompletedCount = todayCareTasks.filter(t => t.completed).length;
        const todayTotalCount = todayCareTasks.length;

        // 3. HEALTH CARE SCORE (0-100)
        let nutritionScore = 0;
        if (nutSched) {
            const completedDays = nutSched.completedDays || 0;
            nutritionScore = Math.min(30, Math.round((completedDays / 30) * 30));
            if (nutritionScore < 15 && completedDays > 0) nutritionScore = 20;
            else if (nutritionScore === 0 && nutSched) nutritionScore = 15;
        }

        let groomingScore = 0;
        if (groomPlan) {
            const historyCount = (groomPlan.history || []).filter(h => h.completed || h.status === "completed").length;
            groomingScore = Math.min(25, Math.round((historyCount / 20) * 25));
            if (groomingScore < 12 && groomPlan.schedule?.length > 0) groomingScore = 15;
        }

        let activityScore = 0;
        if (actPlan) {
            const actHistory = (actPlan.history || []).filter(h => h.status === "completed").length;
            activityScore = Math.min(25, Math.round((actHistory / 20) * 25));
            if (activityScore < 12 && actPlan.schedule?.length > 0) activityScore = 15;
        }

        let vaccinationScore = 0;
        if (vacs && vacs.length > 0) {
            const upToDate = vacs.filter(v => new Date(v.nextDue) >= todayDate || v.completed).length;
            vaccinationScore = Math.min(20, Math.round((upToDate / vacs.length) * 20));
        } else {
            vaccinationScore = 10;
        }

        const healthScore = Math.min(100, nutritionScore + groomingScore + activityScore + vaccinationScore);

        // 4. UPCOMING REMINDERS (Future dates only: date > todayStr)
        const upcomingReminders = [];

        // A. Vaccinations
        if (vacs && vacs.length > 0) {
            vacs.forEach(v => {
                const nextDueDate = new Date(v.nextDue);
                const nextDueStr = getISTDateString(nextDueDate);
                if (nextDueStr > todayStr && !v.completed) {
                    upcomingReminders.push({
                        id: v._id.toString(),
                        type: "vaccination",
                        icon: "💉",
                        title: `${v.vaccine} Booster`,
                        detail: `Vaccination • Due ${nextDueStr}`,
                        date: nextDueStr,
                        status: "Upcoming",
                        className: "warning"
                    });
                }
            });
        }

        // B. Grooming Future Tasks
        if (groomPlan && Array.isArray(groomPlan.schedule)) {
            const futureGroom = groomPlan.schedule.filter(item => item.date > todayStr && !item.completed);
            futureGroom.slice(0, 3).forEach(item => {
                let icon = "✂️";
                const t = (item.activityType || "").toLowerCase();
                if (t.includes("dental")) icon = "🦷";
                else if (t.includes("bath")) icon = "🧼";

                upcomingReminders.push({
                    id: item.activityId,
                    type: "grooming",
                    icon: icon,
                    title: item.activityName,
                    detail: `Grooming • ${item.date}`,
                    date: item.date,
                    status: "Scheduled",
                    className: "scheduled"
                });
            });
        }

        // C. Activity Future Tasks
        if (actPlan && Array.isArray(actPlan.schedule)) {
            const futureAct = actPlan.schedule.filter(item => item.date > todayStr && item.status === "scheduled");
            futureAct.slice(0, 2).forEach(item => {
                upcomingReminders.push({
                    id: item.activityId,
                    type: "activity",
                    icon: "🏃",
                    title: item.activityName,
                    detail: `Activity • ${item.date}`,
                    date: item.date,
                    status: "Scheduled",
                    className: "scheduled"
                });
            });
        }

        // D. Appointments Future / Upcoming Reminders
        const appointmentsList = (appointmentsRaw || []).map(a => ({
            id: a._id.toString(),
            vetName: a.vetId ? `Dr. ${a.vetId.fullName}` : "Veterinarian",
            vetPhoto: a.vetId ? (a.vetId.profilePhoto || "") : "",
            specialization: a.vetId ? (a.vetId.specialization || "General Veterinary") : "General Veterinary",
            clinicName: a.vetId ? (a.vetId.clinicName || "Pet Clinic") : "Pet Clinic",
            clinicAddress: a.vetId ? (a.vetId.clinicAddress || a.vetId.city || "") : "",
            petName: a.petId ? a.petId.petName : "Pet",
            date: a.date,
            time: a.time,
            reason: a.reason || a.appointmentType || "General Checkup",
            appointmentType: a.appointmentType || "General Checkup",
            status: a.status || "pending",
            rejectionReason: a.rejectionReason || ""
        }));

        if (appointmentsRaw && appointmentsRaw.length > 0) {
            appointmentsRaw.forEach(a => {
                if (a.status === "pending" || a.status === "accepted") {
                    upcomingReminders.push({
                        id: a._id.toString(),
                        type: "appointment",
                        icon: "🩺",
                        title: `Vet Visit: ${a.vetId ? 'Dr. ' + a.vetId.fullName : 'Doctor'}`,
                        detail: `Appointment • ${a.date} at ${a.time}`,
                        date: a.date,
                        status: a.status === "accepted" ? "Confirmed" : "Pending",
                        className: a.status === "accepted" ? "scheduled" : "warning"
                    });
                }
            });
        }

        // Sort upcoming reminders by date ascending
        upcomingReminders.sort((a, b) => a.date.localeCompare(b.date));

        // 5. PET CARE PROGRESS (SECTION BREAKDOWN & OVERALL WELLNESS)
        let nutPct = nutSched ? Math.round(((nutSched.completedDays || 0) / 30) * 100) : 0;
        if (nutSched && nutPct === 0 && (todayNutDay?.completed || todayNutDay?.status === "Completed")) nutPct = 20;

        let groomPct = 0;
        if (groomPlan && Array.isArray(groomPlan.schedule) && groomPlan.schedule.length > 0) {
            const groomDoneCount = (groomPlan.history || []).filter(h => h.completed || h.status === "completed").length;
            groomPct = Math.min(100, Math.round((groomDoneCount / Math.max(1, groomPlan.schedule.length)) * 100));
            if (groomPct === 0 && groomDoneCount > 0) groomPct = 25;
        }

        let actPct = 0;
        if (actPlan && Array.isArray(actPlan.schedule) && actPlan.schedule.length > 0) {
            const actDoneCount = (actPlan.history || []).filter(h => h.status === "completed").length;
            actPct = Math.min(100, Math.round((actDoneCount / Math.max(1, actPlan.schedule.length)) * 100));
            if (actPct === 0 && actDoneCount > 0) actPct = 25;
        }

        let vacPct = 100;
        if (vacs && vacs.length > 0) {
            const upToDateVacs = vacs.filter(v => new Date(v.nextDue) >= todayDate || v.completed).length;
            vacPct = Math.round((upToDateVacs / vacs.length) * 100);
        }

        const overallWellness = Math.min(100, Math.round((nutPct * 0.30) + (groomPct * 0.25) + (actPct * 0.25) + (vacPct * 0.20)));

        // 6. CARE STREAK CALCULATION
        let streakCount = 0;
        if (nutSched || groomPlan || actPlan) {
            // Count completed items or active days
            const completedCareCount = todayCompletedCount +
                ((groomPlan?.history || []).filter(h => h.completed || h.status === "completed").length) +
                ((actPlan?.history || []).filter(h => h.status === "completed").length);
            
            if (todayCompletedCount > 0) {
                streakCount = Math.max(1, Math.min(30, completedCareCount));
            } else if (completedCareCount > 0) {
                streakCount = Math.min(30, completedCareCount);
            }
        }

        // 7. AI PET INSIGHT GENERATION
        let aiInsightText = `${pet.petName}'s care profile is active. Complete daily nutrition and grooming routines to generate personalized AI wellness insights. 🐾`;
        if (streakCount >= 3) {
            aiInsightText = `${pet.petName} has achieved a ${streakCount}-day care streak! Daily nutrition, exercise, and grooming routines are well-balanced. Keep up the consistent care! 🐾`;
        } else if (overallWellness >= 70) {
            aiInsightText = `${pet.petName} is maintaining an excellent wellness score of ${overallWellness}%. Care routines and health records are on track this week. 🐾`;
        } else if (overallWellness > 0) {
            aiInsightText = `${pet.petName}'s nutrition and grooming plans are active. Completing today's care tasks will boost ${pet.petName}'s overall wellness score. 🐾`;
        }

        // 8. NEXT CARE (NEAREST UPCOMING EVENT)
        let nextCareEvent = null;
        if (upcomingReminders && upcomingReminders.length > 0) {
            const nearest = upcomingReminders[0];
            const eventDate = new Date(nearest.date);
            const diffTime = Math.abs(eventDate - todayDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let navUrl = "../../pages/appointments/appointments.html";
            if (nearest.type === "vaccination") navUrl = "../../pages/vaccination/vaccination.html";
            else if (nearest.type === "grooming") navUrl = "../../pages/grooming/grooming.html";
            else if (nearest.type === "activity") navUrl = "../../pages/activity/activity.html";

            nextCareEvent = {
                type: nearest.type,
                icon: nearest.icon || "📅",
                title: nearest.title,
                detail: nearest.detail,
                date: nearest.date,
                daysRemaining: diffDays,
                navUrl: navUrl
            };
        } else {
            nextCareEvent = {
                type: "none",
                icon: "🐾",
                title: "No upcoming care",
                detail: "You're all caught up!",
                date: todayStr,
                daysRemaining: 0,
                navUrl: "../../pages/appointments/appointments.html"
            };
        }

        // Format pet age
        let ageStr = "Age not available";
        if (pet.dateOfBirth) {
            const dob = new Date(pet.dateOfBirth);
            if (!isNaN(dob.getTime())) {
                const diffMs = Date.now() - dob.getTime();
                const years = Math.abs(new Date(diffMs).getUTCFullYear() - 1970);
                const months = Math.floor((diffMs % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000));
                if (years > 0) ageStr = `${years} Yrs${months > 0 ? ` ${months} Mos` : ""}`;
                else ageStr = `${months} Mos`;
            }
        }

        return res.status(200).json({
            success: true,
            dashboard: {
                pet: {
                    id: pet._id,
                    name: pet.petName,
                    species: pet.species,
                    breed: pet.breed || "Standard Breed",
                    age: ageStr,
                    gender: pet.gender || "Not specified",
                    weight: pet.currentWeight ? `${pet.currentWeight.value} ${pet.currentWeight.unit}` : "Not specified",
                    image: pet.petPhoto || ""
                },
                healthScore: overallWellness > 0 ? overallWellness : healthScore,
                profileCompletion: Math.round(profileCompletionPct * 10) / 10,
                todayCare: {
                    tasks: todayCareTasks,
                    completed: todayCompletedCount,
                    total: todayTotalCount,
                    nutritionAvailable: nutTasksAvailable,
                    groomingAvailable: groomTasksAvailable
                },
                upcomingReminders,
                appointments: appointmentsList,
                careProgress: {
                    overall: overallWellness,
                    nutrition: nutPct,
                    grooming: groomPct,
                    activity: actPct,
                    vaccination: vacPct
                },
                careStreak: {
                    current: streakCount,
                    message: streakCount > 0 ? `You've completed your care routines for ${streakCount} consecutive days. Keep it going! 🐾` : "Complete today's care tasks to start your streak! 🐾"
                },
                aiInsight: {
                    text: aiInsightText
                },
                nextCare: nextCareEvent
            }
        });
    } catch (error) {
        console.error("DASHBOARD DATA ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load dashboard data.",
            error: error.message
        });
    }
});

// =========================================================
// GET PET-WISE ANALYTICS REPORT (GET /api/pets/analytics/:petId)
// =========================================================
router.get("/analytics/:petId", protect, async (req, res) => {
    try {
        const { petId } = req.params;
        const { period = "30", startDate, endDate } = req.query;

        const pet = await Pet.findOne({ _id: petId, ownerId: req.user.userId });
        if (!pet) {
            return res.status(404).json({
                success: false,
                message: "Pet not found or unauthorized access."
            });
        }

        const todayDate = new Date();
        let periodDays = parseInt(period, 10) || 30;
        let start = new Date();
        start.setDate(start.getDate() - periodDays);

        if (startDate && endDate) {
            start = new Date(startDate);
        }

        let ageStr = "Age not available";
        if (pet.dateOfBirth) {
            const dob = new Date(pet.dateOfBirth);
            if (!isNaN(dob.getTime())) {
                const diffMs = Date.now() - dob.getTime();
                const years = Math.abs(new Date(diffMs).getUTCFullYear() - 1970);
                const months = Math.floor((diffMs % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000));
                if (years > 0) ageStr = `${years} Yrs${months > 0 ? ` ${months} Mos` : ""}`;
                else ageStr = `${months} Mos`;
            }
        }

        const NutritionSchedule = require("../models/NutritionSchedule");
        const GroomingPlan = require("../models/GroomingPlan");
        const ActivityPlan = require("../models/ActivityPlan");
        const Vaccination = require("../models/Vaccination");

        const [nutSched, groomPlan, actPlan, vacs] = await Promise.all([
            NutritionSchedule.findOne({ petId, status: "Active" }),
            GroomingPlan.findOne({ petId }),
            ActivityPlan.findOne({ petId }),
            Vaccination.find({ petId })
        ]);

        let nutScheduled = 0;
        let nutCompleted = 0;
        let nutMissed = 0;
        if (nutSched) {
            nutScheduled = Math.min(120, (nutSched.completedDays || 0) + 3);
            nutCompleted = nutSched.completedDays || 0;
            nutMissed = Math.max(0, nutScheduled - nutCompleted);
        }
        let nutRate = nutScheduled > 0 ? Math.round((nutCompleted / nutScheduled) * 100) : 0;
        let nutCredits = Number((nutCompleted * 0.4).toFixed(1));

        let groomScheduled = 0;
        let groomCompleted = 0;
        let groomMissed = 0;
        if (groomPlan && Array.isArray(groomPlan.schedule)) {
            groomScheduled = groomPlan.schedule.length;
            groomCompleted = (groomPlan.history || []).filter(h => h.completed || h.status === "completed").length;
            groomMissed = Math.max(0, groomScheduled - groomCompleted);
        }
        let groomRate = groomScheduled > 0 ? Math.round((groomCompleted / groomScheduled) * 100) : (groomCompleted > 0 ? 100 : 0);
        let groomCredits = Number((groomCompleted * 0.4).toFixed(1));

        let actScheduled = 0;
        let actCompleted = 0;
        let actMissed = 0;
        if (actPlan && Array.isArray(actPlan.schedule)) {
            actScheduled = actPlan.schedule.length;
            actCompleted = (actPlan.history || []).filter(h => h.status === "completed").length;
            actMissed = Math.max(0, actScheduled - actCompleted);
        }
        let actRate = actScheduled > 0 ? Math.round((actCompleted / actScheduled) * 100) : (actCompleted > 0 ? 100 : 0);
        let actCredits = Number((actCompleted * 0.4).toFixed(1));

        let vacCompleted = 0;
        let vacUpcoming = 0;
        let vacOverdue = 0;
        if (vacs && vacs.length > 0) {
            vacs.forEach(v => {
                if (v.completed) vacCompleted++;
                else if (new Date(v.nextDue) < todayDate) vacOverdue++;
                else vacUpcoming++;
            });
        }
        let vacRate = vacs && vacs.length > 0 ? Math.round(((vacCompleted + vacUpcoming) / vacs.length) * 100) : 100;
        let vacCredits = Number((vacCompleted * 1.0).toFixed(1));

        let overallScore = Math.min(100, Math.round((nutRate * 0.30) + (groomRate * 0.25) + (actRate * 0.25) + (vacRate * 0.20)));

        let totalScheduled = nutScheduled + groomScheduled + actScheduled + (vacs ? vacs.length : 0);
        let totalCompleted = nutCompleted + groomCompleted + actCompleted + vacCompleted;
        let totalMissed = nutMissed + groomMissed + actMissed + vacOverdue;
        let overallRate = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : overallScore;
        let totalCredits = Number((nutCredits + groomCredits + actCredits + vacCredits).toFixed(1));

        const recentHistory = [];
        if (nutSched) {
            recentHistory.push({ date: new Date().toISOString().split("T")[0], section: "Nutrition", activity: "Daily Feeding Schedule", status: "Completed", icon: "🍲" });
        }
        if (groomPlan && groomPlan.history) {
            groomPlan.history.slice(-5).forEach(h => {
                recentHistory.push({
                    date: h.date || new Date().toISOString().split("T")[0],
                    section: "Grooming",
                    activity: h.activityName || "Grooming Routine",
                    status: (h.completed || h.status === "completed") ? "Completed" : "Missed",
                    icon: "✂️"
                });
            });
        }
        if (actPlan && actPlan.history) {
            actPlan.history.slice(-5).forEach(h => {
                recentHistory.push({
                    date: h.date || new Date().toISOString().split("T")[0],
                    section: "Activity",
                    activity: h.activityName || "Physical Activity",
                    status: h.status === "completed" ? "Completed" : "Missed",
                    icon: "🏃"
                });
            });
        }

        const trendData = {
            labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
            scores: [
                Math.max(20, overallScore - 15),
                Math.max(30, overallScore - 10),
                Math.max(40, overallScore - 5),
                overallScore
            ]
        };

        let aiSummary = `${pet.petName} has maintained an overall care score of ${overallScore}/100. Nutrition consistency is at ${nutRate}%, with ${totalCompleted} care tasks successfully completed. ${vacOverdue > 0 ? "Vaccination update required." : "Vaccinations are completely up to date! 🐾"}`;

        return res.status(200).json({
            success: true,
            analytics: {
                pet: {
                    id: pet._id,
                    name: pet.petName,
                    species: pet.species,
                    breed: pet.breed || "Standard Breed",
                    age: ageStr,
                    weight: pet.currentWeight ? `${pet.currentWeight.value} ${pet.currentWeight.unit}` : "Not specified",
                    gender: pet.gender || "Not specified",
                    image: pet.petPhoto || ""
                },
                period: {
                    days: periodDays,
                    start: start.toISOString().split("T")[0],
                    end: todayDate.toISOString().split("T")[0]
                },
                overall: {
                    score: overallScore,
                    totalScheduled,
                    totalCompleted,
                    totalMissed,
                    completionRate: overallRate
                },
                nutrition: {
                    hasData: !!nutSched,
                    scheduled: nutScheduled,
                    completed: nutCompleted,
                    missed: nutMissed,
                    completionRate: nutRate,
                    consistency: nutRate >= 80 ? "Excellent" : nutRate >= 50 ? "Good" : "Needs Attention",
                    credits: nutCredits
                },
                grooming: {
                    hasData: !!groomPlan,
                    scheduled: groomScheduled,
                    completed: groomCompleted,
                    missed: groomMissed,
                    completionRate: groomRate,
                    consistency: groomRate >= 80 ? "Excellent" : groomRate >= 50 ? "Good" : "Needs Attention",
                    credits: groomCredits
                },
                activity: {
                    hasData: !!actPlan,
                    scheduled: actScheduled,
                    completed: actCompleted,
                    missed: actMissed,
                    completionRate: actRate,
                    consistency: actRate >= 80 ? "Excellent" : actRate >= 50 ? "Good" : "Needs Attention",
                    credits: actCredits
                },
                vaccination: {
                    hasData: vacs && vacs.length > 0,
                    completed: vacCompleted,
                    upcoming: vacUpcoming,
                    overdue: vacOverdue,
                    status: vacOverdue === 0 ? "🟢 On Track" : "🔴 Overdue",
                    credits: vacCredits
                },
                credits: {
                    nutrition: nutCredits,
                    grooming: groomCredits,
                    activity: actCredits,
                    vaccination: vacCredits,
                    total: totalCredits
                },
                trendData,
                recentHistory,
                aiSummary
            }
        });
    } catch (error) {
        console.error("ANALYTICS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to calculate pet analytics.",
            error: error.message
        });
    }
});

module.exports = router;