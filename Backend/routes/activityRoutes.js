const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Pet = require("../models/Pet");
const ActivityPlan = require("../models/ActivityPlan");
const protect = require("../middleware/authMiddleware");
const { generateActivityPlan } = require("../services/geminiService");
const activityKnowledgeBase = require("../knowledgeBase/activityKnowledgeBase");

// Helper to extract user ID safely
function getUserId(req) {
    if (!req.user) return null;
    return req.user.userId || req.user.id || req.user._id || (typeof req.user === "string" ? req.user : null);
}

// Helper for IST date string YYYY-MM-DD
function getISTDateString(date = new Date()) {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(date);
}

// Add days helper
function addDays(dateStr, numDays) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    date.setUTCDate(date.getUTCDate() + numDays);
    return date.toISOString().split("T")[0];
}

// Validate pet ownership
async function validatePetOwnership(petId, userId) {
    if (!petId) {
        const error = new Error("Pet ID is required.");
        error.status = 400;
        throw error;
    }
    if (!mongoose.Types.ObjectId.isValid(petId)) {
        const error = new Error(`Invalid Pet ID format: ${petId}`);
        error.status = 400;
        throw error;
    }
    const pet = await Pet.findById(petId);
    if (!pet) {
        const error = new Error("Pet not found.");
        error.status = 404;
        throw error;
    }
    const petOwnerId = pet.ownerId ? pet.ownerId.toString() : (pet.owner ? pet.owner.toString() : "");
    const currentUserId = userId ? userId.toString() : "";
    if (petOwnerId && currentUserId && petOwnerId !== currentUserId) {
        const error = new Error("Access denied. You do not own this pet.");
        error.status = 403;
        throw error;
    }
    return pet;
}

// Helper to update past overdue tasks to "failed"
function updateOverdueActivities(plan, todayStr) {
    let updated = false;
    if (!plan || !plan.schedule) return false;

    plan.schedule.forEach(item => {
        if (item.date < todayStr && item.status === "scheduled") {
            item.status = "failed";
            updated = true;

            // Check if already in history
            const existsInHistory = plan.history.some(h => h.activityId === item.activityId);
            if (!existsInHistory) {
                plan.history.push({
                    activityId: item.activityId,
                    date: item.date,
                    activityName: item.activityName,
                    category: item.category,
                    status: "failed",
                    creditValue: 0,
                    timestamp: new Date()
                });
            }
        }
    });

    return updated;
}

// =========================================================
// GET /api/activity/profile/:petId
// =========================================================
router.get("/profile/:petId", protect, async (req, res) => {
    try {
        const userId = getUserId(req);
        const pet = await validatePetOwnership(req.params.petId, userId);

        let plan = await ActivityPlan.findOne({ petId: pet._id });
        if (!plan || !plan.activityProfile || !plan.activityProfile.isProfileCompleted) {
            return res.status(200).json({
                success: false,
                code: "PROFILE_INCOMPLETE",
                profileIncomplete: true,
                petName: pet.petName || pet.name || "Pet",
                message: `${pet.petName || pet.name || "Pet"}'s Activity profile is not completed yet.`
            });
        }

        return res.status(200).json({
            success: true,
            petName: pet.petName || pet.name,
            activityProfile: plan.activityProfile
        });
    } catch (error) {
        console.error("GET Activity Profile Error:", error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Failed to retrieve activity profile."
        });
    }
});

// =========================================================
// POST /api/activity/profile/:petId
// =========================================================
router.post("/profile/:petId", protect, async (req, res) => {
    try {
        const userId = getUserId(req);
        const pet = await validatePetOwnership(req.params.petId, userId);

        const {
            activityLevel,
            energyLevel,
            lifestyle,
            currentRoutine,
            favoriteActivities,
            dislikedActivities,
            environment,
            activityRestrictions
        } = req.body;

        let plan = await ActivityPlan.findOne({ petId: pet._id });
        const now = new Date();

        if (!plan) {
            plan = new ActivityPlan({
                userId: userId,
                petId: pet._id,
                planStartDate: now,
                planEndDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
                activityProfile: {
                    activityLevel: activityLevel || "Moderate",
                    energyLevel: energyLevel || "Moderate",
                    lifestyle: lifestyle || "Mixed",
                    currentRoutine: Array.isArray(currentRoutine) ? currentRoutine : ["Walking"],
                    favoriteActivities: favoriteActivities || "",
                    dislikedActivities: dislikedActivities || "",
                    environment: environment || "Outdoor access",
                    activityRestrictions: activityRestrictions || "",
                    isProfileCompleted: true,
                    updatedAt: now
                },
                schedule: [],
                history: []
            });
        } else {
            plan.activityProfile = {
                ...plan.activityProfile,
                activityLevel: activityLevel || plan.activityProfile.activityLevel || "Moderate",
                energyLevel: energyLevel || plan.activityProfile.energyLevel || "Moderate",
                lifestyle: lifestyle || plan.activityProfile.lifestyle || "Mixed",
                currentRoutine: Array.isArray(currentRoutine) ? currentRoutine : plan.activityProfile.currentRoutine,
                favoriteActivities: favoriteActivities !== undefined ? favoriteActivities : plan.activityProfile.favoriteActivities,
                dislikedActivities: dislikedActivities !== undefined ? dislikedActivities : plan.activityProfile.dislikedActivities,
                environment: environment || plan.activityProfile.environment,
                activityRestrictions: activityRestrictions !== undefined ? activityRestrictions : plan.activityProfile.activityRestrictions,
                isProfileCompleted: true,
                updatedAt: now
            };
        }

        await plan.save();

        return res.status(200).json({
            success: true,
            message: "Activity profile saved successfully!",
            activityProfile: plan.activityProfile
        });
    } catch (error) {
        console.error("POST Activity Profile Error:", error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Failed to save activity profile."
        });
    }
});

// =========================================================
// GET /api/activity/plan/:petId
// =========================================================
router.get("/plan/:petId", protect, async (req, res) => {
    try {
        const userId = getUserId(req);
        const pet = await validatePetOwnership(req.params.petId, userId);
        const todayStr = getISTDateString();

        let plan = await ActivityPlan.findOne({ petId: pet._id });

        if (!plan || !plan.activityProfile || !plan.activityProfile.isProfileCompleted) {
            return res.status(200).json({
                success: false,
                code: "PROFILE_INCOMPLETE",
                profileIncomplete: true,
                petName: pet.petName || pet.name || "Pet",
                message: `${pet.petName || pet.name || "Pet"}'s Activity profile is not completed yet.`
            });
        }

        // If no schedule generated yet, generate one automatically
        if (!plan.schedule || plan.schedule.length === 0) {
            const aiData = await generateActivityPlan(pet, plan.activityProfile, plan.history, activityKnowledgeBase);
            const startDateStr = todayStr;
            plan.planStartDate = new Date();
            plan.planEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

            const scheduleItems = [];
            let itemCounter = 1;

            aiData.activities.forEach(act => {
                const itemDate = addDays(startDateStr, act.dayNumber - 1);
                scheduleItems.push({
                    activityId: `act_${pet._id}_${act.dayNumber}_${itemCounter++}`,
                    date: itemDate,
                    dayNumber: act.dayNumber,
                    weekNumber: act.weekNumber || Math.min(4, Math.floor((act.dayNumber - 1) / 7) + 1),
                    category: act.category || "physical_activity",
                    activityName: act.activityName,
                    description: act.description || "",
                    duration: act.duration || 20,
                    creditValue: act.creditValue || 0.4,
                    status: "scheduled",
                    completedAt: null
                });
            });

            plan.schedule = scheduleItems;
            await plan.save();
        } else {
            // Update overdue tasks to failed
            const hasChanges = updateOverdueActivities(plan, todayStr);
            if (hasChanges) {
                await plan.save();
            }
        }

        return res.status(200).json({
            success: true,
            petName: pet.petName || pet.name,
            planStartDate: plan.planStartDate,
            planEndDate: plan.planEndDate,
            activityProfile: plan.activityProfile,
            schedule: plan.schedule,
            history: plan.history
        });
    } catch (error) {
        console.error("GET Activity Plan Error:", error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Failed to retrieve activity plan."
        });
    }
});

// =========================================================
// POST /api/activity/generate-plan/:petId
// =========================================================
router.post("/generate-plan/:petId", protect, async (req, res) => {
    try {
        const userId = getUserId(req);
        const pet = await validatePetOwnership(req.params.petId, userId);
        const todayStr = getISTDateString();

        let plan = await ActivityPlan.findOne({ petId: pet._id });
        if (!plan || !plan.activityProfile || !plan.activityProfile.isProfileCompleted) {
            return res.status(200).json({
                success: false,
                code: "PROFILE_INCOMPLETE",
                profileIncomplete: true,
                petName: pet.petName || pet.name || "Pet",
                message: `${pet.petName || pet.name || "Pet"}'s Activity profile is not completed yet.`
            });
        }

        const aiData = await generateActivityPlan(pet, plan.activityProfile, plan.history, activityKnowledgeBase);
        const startDateStr = todayStr;
        plan.planStartDate = new Date();
        plan.planEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        const scheduleItems = [];
        let itemCounter = 1;

        aiData.activities.forEach(act => {
            const itemDate = addDays(startDateStr, act.dayNumber - 1);
            scheduleItems.push({
                activityId: `act_${pet._id}_${act.dayNumber}_${itemCounter++}`,
                date: itemDate,
                dayNumber: act.dayNumber,
                weekNumber: act.weekNumber || Math.min(4, Math.floor((act.dayNumber - 1) / 7) + 1),
                category: act.category || "physical_activity",
                activityName: act.activityName,
                description: act.description || "",
                duration: act.duration || 20,
                creditValue: act.creditValue || 0.4,
                status: "scheduled",
                completedAt: null
            });
        });

        plan.schedule = scheduleItems;
        await plan.save();

        return res.status(200).json({
            success: true,
            message: "Personalized 30-day activity plan generated successfully! 🏃",
            planStartDate: plan.planStartDate,
            planEndDate: plan.planEndDate,
            schedule: plan.schedule
        });
    } catch (error) {
        console.error("POST Generate Activity Plan Error:", error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Failed to generate activity plan."
        });
    }
});

// =========================================================
// POST /api/activity/complete
// Body: { petId, activityId, date }
// =========================================================
router.post("/complete", protect, async (req, res) => {
    try {
        const userId = getUserId(req);
        const { petId, activityId, date } = req.body;

        const pet = await validatePetOwnership(petId, userId);
        const todayStr = getISTDateString();

        // Must be completed TODAY
        if (date && date !== todayStr) {
            return res.status(400).json({
                success: false,
                message: "Only today's scheduled activities can be marked complete."
            });
        }

        const plan = await ActivityPlan.findOne({ petId: pet._id });
        if (!plan) {
            return res.status(404).json({
                success: false,
                message: "No activity plan found for this pet."
            });
        }

        const task = plan.schedule.find(item => item.activityId === activityId || (item.date === todayStr && item.status === "scheduled"));
        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Scheduled activity not found."
            });
        }

        if (task.status === "completed") {
            return res.status(400).json({
                success: false,
                message: "Activity is already marked complete."
            });
        }

        if (task.date < todayStr || task.status === "failed") {
            return res.status(400).json({
                success: false,
                message: "Missed activities cannot be completed retroactively."
            });
        }

        task.status = "completed";
        task.completedAt = new Date();

        // Push to history if not exists
        const existsInHistory = plan.history.some(h => h.activityId === task.activityId && h.status === "completed");
        if (!existsInHistory) {
            plan.history.push({
                activityId: task.activityId,
                date: task.date,
                activityName: task.activityName,
                category: task.category,
                status: "completed",
                creditValue: task.creditValue || 0.4,
                timestamp: new Date()
            });
        }

        await plan.save();

        return res.status(200).json({
            success: true,
            message: "Activity marked complete! +0.4 Activity Credits awarded. 🏃",
            creditEarned: task.creditValue || 0.4,
            activity: task
        });
    } catch (error) {
        console.error("POST Complete Activity Error:", error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Failed to complete activity."
        });
    }
});

// =========================================================
// GET /api/activity/history/:petId
// =========================================================
router.get("/history/:petId", protect, async (req, res) => {
    try {
        const userId = getUserId(req);
        const pet = await validatePetOwnership(req.params.petId, userId);

        const plan = await ActivityPlan.findOne({ petId: pet._id });
        const history = plan ? plan.history : [];

        return res.status(200).json({
            success: true,
            petName: pet.petName || pet.name,
            history: history
        });
    } catch (error) {
        console.error("GET Activity History Error:", error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Failed to retrieve activity history."
        });
    }
});

module.exports = router;
