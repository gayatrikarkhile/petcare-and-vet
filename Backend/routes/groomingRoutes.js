const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Pet = require("../models/Pet");
const GroomingPlan = require("../models/GroomingPlan");
const protect = require("../middleware/authMiddleware");
const { generateGroomingPlan } = require("../services/geminiService");
const groomingKnowledgeBase = require("../knowledgeBase/groomingKnowledgeBase");

// Helper to extract user ID from JWT payload safely
function getUserId(req) {
    if (!req.user) return null;
    return req.user.userId || req.user.id || req.user._id || (typeof req.user === "string" ? req.user : null);
}

// Helper for IST date strings YYYY-MM-DD
function getISTDateString(date = new Date()) {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(date);
}

// Date arithmetic helpers for rolling 30-day plan
function addDays(dateStr, numDays) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    date.setUTCDate(date.getUTCDate() + numDays);
    return date.toISOString().split("T")[0];
}

function getDaysDiff(startDateStr, endDateStr) {
    const [y1, m1, d1] = startDateStr.split("-").map(Number);
    const [y2, m2, d2] = endDateStr.split("-").map(Number);
    const t1 = Date.UTC(y1, m1 - 1, d1);
    const t2 = Date.UTC(y2, m2 - 1, d2);
    return Math.floor((t2 - t1) / (24 * 60 * 60 * 1000));
}

function getDayOfWeekName(dateStr) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][date.getUTCDay()];
}

function calculateAge(dateOfBirth) {
    if (!dateOfBirth) return "Unknown";
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) return "Unknown";
    const diffMs = Date.now() - dob.getTime();
    const ageDate = new Date(diffMs);
    const years = Math.abs(ageDate.getUTCFullYear() - 1970);
    const months = Math.floor((diffMs % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000));
    if (years > 0) {
        return `${years} Year${years > 1 ? "s" : ""}` + (months > 0 ? ` ${months} Mos` : "");
    }
    return `${months} Month${months > 1 ? "s" : ""}`;
}

// Validate pet ownership middleware safely
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

    const petOwnerId = pet.ownerId ? pet.ownerId.toString() : "";
    const currentUserId = userId ? userId.toString() : "";

    if (petOwnerId && currentUserId && petOwnerId !== currentUserId) {
        const error = new Error("Unauthorized access to pet data.");
        error.status = 403;
        throw error;
    }
    return pet;
}

// Helper to map species to knowledge base key
function getGroomingKnowledge(species) {
    if (!species) return groomingKnowledgeBase.Other;
    const normalized = String(species).trim().toLowerCase();
    if (normalized.includes("dog")) return groomingKnowledgeBase.Dog;
    if (normalized.includes("cat")) return groomingKnowledgeBase.Cat;
    if (normalized.includes("bird")) return groomingKnowledgeBase.Bird;
    if (normalized.includes("rabbit")) return groomingKnowledgeBase.Rabbit;
    if (normalized.includes("horse")) return groomingKnowledgeBase.Horse;
    if (normalized.includes("turtle")) return groomingKnowledgeBase.Turtle;
    if (normalized.includes("fish")) return groomingKnowledgeBase.Fish;
    return groomingKnowledgeBase.Other;
}

// =========================================================
// 1. GET GROOMING PROFILE (Pre-filled from Pet Profile)
// =========================================================
router.get("/profile/:petId", protect, async (req, res) => {
    try {
        const userId = getUserId(req);
        const { petId } = req.params;
        const pet = await validatePetOwnership(petId, userId);

        const activePlan = await GroomingPlan.findOne({ petId, status: "active" }).sort({ createdAt: -1 })
            || await GroomingPlan.findOne({ petId }).sort({ createdAt: -1 });

        const petInfo = {
            petId: pet._id,
            petName: pet.petName,
            species: pet.species,
            breed: pet.breed,
            age: calculateAge(pet.dateOfBirth),
            gender: pet.gender,
            weight: pet.currentWeight ? `${pet.currentWeight.value} ${pet.currentWeight.unit || "kg"}` : "N/A",
            petPhoto: pet.petPhoto || ""
        };

        return res.json({
            success: true,
            pet: petInfo,
            groomingProfile: activePlan ? activePlan.groomingProfile : {}
        });
    } catch (error) {
        console.error("Error fetching grooming profile:", error.message);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Failed to fetch grooming profile."
        });
    }
});

// =========================================================
// 2. SAVE / UPDATE GROOMING PROFILE
// =========================================================
router.post("/profile/:petId", protect, async (req, res) => {
    try {
        const userId = getUserId(req);
        const { petId } = req.params;
        const pet = await validatePetOwnership(petId, userId);

        const profileData = req.body;
        const todayDateStr = getISTDateString();
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        let plan = await GroomingPlan.findOne({ petId, status: "active" }).sort({ createdAt: -1 })
            || await GroomingPlan.findOne({ petId }).sort({ createdAt: -1 });

        if (!plan) {
            plan = new GroomingPlan({
                userId: pet.ownerId || userId,
                petId,
                planStartDate: todayDateStr,
                planEndDate: addDays(todayDateStr, 29),
                status: "active",
                month,
                year,
                groomingProfile: profileData,
                activities: [],
                completionHistory: [],
                rawCredits: 0,
                groomingScore: 0
            });
        } else {
            plan.groomingProfile = { ...plan.groomingProfile, ...profileData };
        }

        await plan.save();

        return res.json({
            success: true,
            message: "Grooming and Dental profile saved successfully.",
            planId: plan._id,
            groomingProfile: plan.groomingProfile
        });
    } catch (error) {
        console.error("Error saving grooming profile:", error.message);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Failed to save grooming profile."
        });
    }
});

// =========================================================
// 3. GENERATE ROLLING 30-DAY GROOMING PLAN (GEMINI AI)
// =========================================================
router.post("/generate-plan/:petId", protect, async (req, res) => {
    try {
        const userId = getUserId(req);
        const { petId } = req.params;
        const pet = await validatePetOwnership(petId, userId);

        const todayDateStr = getISTDateString();
        const planStartDate = todayDateStr;
        const planEndDate = addDays(planStartDate, 29);
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        // Reuse existing plan document to avoid duplicate key index issues
        let plan = await GroomingPlan.findOne({ petId, month, year })
            || await GroomingPlan.findOne({ petId }).sort({ createdAt: -1 });

        const groomingProfile = req.body.groomingProfile || (plan ? plan.groomingProfile : {});
        const isProfileCompleted = Boolean(
            groomingProfile &&
            (groomingProfile.coatType || groomingProfile.profileCompleted || groomingProfile.brushingFrequency) &&
            String(groomingProfile.coatType || "").trim() !== ""
        );

        if (!isProfileCompleted) {
            return res.status(200).json({
                success: false,
                code: "PROFILE_INCOMPLETE",
                profileIncomplete: true,
                message: `${pet.petName}'s Grooming profile is not completed yet. Please complete the Grooming information before generating a personalized monthly grooming plan.`,
                pet: {
                    petId: pet._id,
                    petName: pet.petName,
                    species: pet.species,
                    breed: pet.breed
                }
            });
        }

        const knowledge = getGroomingKnowledge(pet.species);

        const petDataForAi = {
            id: pet._id,
            petName: pet.petName,
            species: pet.species,
            breed: pet.breed,
            age: calculateAge(pet.dateOfBirth),
            gender: pet.gender,
            weight: pet.currentWeight
        };

        const aiResult = await generateGroomingPlan(petDataForAi, groomingProfile, knowledge, []);

        const activities = (aiResult.activities || []).map((act, index) => {
            const dayNum = Math.min(30, Math.max(1, act.dayNumber || (index + 1)));
            const activityDateStr = addDays(planStartDate, dayNum - 1);
            const weekNum = Math.min(4, Math.floor((dayNum - 1) / 7) + 1);

            return {
                activityId: `act_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`,
                date: activityDateStr,
                dayNumber: dayNum,
                weekNumber: weekNum,
                dayOfWeek: act.dayOfWeek || getDayOfWeekName(activityDateStr),
                activityType: act.activityType || "coat_care",
                activityName: act.activityName || "Grooming Activity",
                description: act.description || "",
                creditValue: 0.4,
                completed: false,
                completedAt: null
            };
        });

        if (!plan) {
            plan = new GroomingPlan({
                userId: pet.ownerId || userId,
                petId,
                planStartDate,
                planEndDate,
                status: "active",
                month,
                year,
                groomingProfile,
                monthlyPlanSummary: aiResult.summary || {},
                activities,
                completionHistory: [],
                rawCredits: 0,
                groomingScore: 0
            });
        } else {
            plan.planStartDate = planStartDate;
            plan.planEndDate = planEndDate;
            plan.status = "active";
            plan.month = month;
            plan.year = year;
            plan.groomingProfile = { ...plan.groomingProfile, ...groomingProfile };
            plan.monthlyPlanSummary = aiResult.summary || {};
            plan.activities = activities;
            plan.completionHistory = [];
            plan.rawCredits = 0;
            plan.groomingScore = 0;
        }

        await plan.save();

        return res.json({
            success: true,
            message: `Personalized 30-day Grooming Plan starting ${planStartDate} generated successfully.`,
            plan
        });
    } catch (error) {
        console.error("Error generating grooming plan:", error.message);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Failed to generate grooming plan."
        });
    }
});

// =========================================================
// 4. GET ACTIVE GROOMING PLAN & STATS FOR SELECTED PET
// =========================================================
router.get("/plan/:petId", protect, async (req, res) => {
    try {
        const userId = getUserId(req);
        const { petId } = req.params;
        const pet = await validatePetOwnership(petId, userId);

        const todayDateStr = getISTDateString();
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        let plan = await GroomingPlan.findOne({ petId, status: "active" }).sort({ createdAt: -1 })
            || await GroomingPlan.findOne({ petId }).sort({ createdAt: -1 });

        const groomingProfile = plan ? plan.groomingProfile : null;
        const isProfileCompleted = Boolean(
            groomingProfile &&
            (groomingProfile.coatType || groomingProfile.profileCompleted || groomingProfile.brushingFrequency) &&
            String(groomingProfile.coatType || "").trim() !== ""
        );

        if (!isProfileCompleted) {
            return res.status(200).json({
                success: false,
                code: "PROFILE_INCOMPLETE",
                profileIncomplete: true,
                message: `${pet.petName}'s Grooming profile is not completed yet. Complete the Grooming information first to generate a personalized monthly grooming plan.`,
                pet: {
                    petId: pet._id,
                    petName: pet.petName,
                    species: pet.species,
                    breed: pet.breed
                }
            });
        }

        // Auto-generate rolling 30-day plan if profile completed BUT no activities or plan expired
        if (!plan || !plan.activities || plan.activities.length === 0 || todayDateStr > plan.planEndDate) {
            const knowledge = getGroomingKnowledge(pet.species);
            const petDataForAi = {
                id: pet._id,
                petName: pet.petName,
                species: pet.species,
                breed: pet.breed,
                age: calculateAge(pet.dateOfBirth),
                gender: pet.gender,
                weight: pet.currentWeight
            };
            const profile = plan ? plan.groomingProfile : {};
            const aiResult = await generateGroomingPlan(petDataForAi, profile, knowledge, []);

            const planStartDate = todayDateStr;
            const planEndDate = addDays(planStartDate, 29);

            const activities = (aiResult.activities || []).map((act, index) => {
                const dayNum = Math.min(30, Math.max(1, act.dayNumber || (index + 1)));
                const activityDateStr = addDays(planStartDate, dayNum - 1);
                const weekNum = Math.min(4, Math.floor((dayNum - 1) / 7) + 1);

                return {
                    activityId: `act_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`,
                    date: activityDateStr,
                    dayNumber: dayNum,
                    weekNumber: weekNum,
                    dayOfWeek: act.dayOfWeek || getDayOfWeekName(activityDateStr),
                    activityType: act.activityType || "coat_care",
                    activityName: act.activityName || "Grooming Activity",
                    description: act.description || "",
                    creditValue: 0.4,
                    completed: false,
                    completedAt: null
                };
            });

            if (!plan) {
                plan = new GroomingPlan({
                    userId: pet.ownerId || userId,
                    petId,
                    planStartDate,
                    planEndDate,
                    status: "active",
                    month,
                    year,
                    groomingProfile: profile,
                    monthlyPlanSummary: aiResult.summary || {},
                    activities,
                    completionHistory: [],
                    rawCredits: 0,
                    groomingScore: 0
                });
            } else {
                plan.planStartDate = planStartDate;
                plan.planEndDate = planEndDate;
                plan.status = "active";
                plan.month = month;
                plan.year = year;
                plan.monthlyPlanSummary = aiResult.summary || {};
                plan.activities = activities;
                plan.completionHistory = [];
                plan.rawCredits = 0;
                plan.groomingScore = 0;
            }

            await plan.save();
        }

        // Calculate dynamic status for each activity evaluated against today
        const processedActivities = (plan.activities || []).map(act => {
            const actObj = act.toObject ? act.toObject() : { ...act };
            if (actObj.completed) {
                actObj.status = "completed";
            } else if (actObj.date < todayDateStr) {
                actObj.status = "failed"; // Missed date -> Expired
            } else if (actObj.date === todayDateStr) {
                actObj.status = "due_today"; // Active for completion today
            } else {
                actObj.status = "scheduled"; // Future date
            }
            return actObj;
        });

        // Filter Today's Grooming tasks (date === todayDateStr)
        const todaysActivities = processedActivities.filter(act => act.date === todayDateStr);

        // Calculate current active week based on planStartDate
        const daysSinceStart = getDaysDiff(plan.planStartDate, todayDateStr);
        const currentWeekNum = Math.min(4, Math.max(1, Math.floor(daysSinceStart / 7) + 1));

        const weeklyActivities = processedActivities.filter(act => act.weekNumber === currentWeekNum);
        const weeklyCompleted = weeklyActivities.filter(act => act.completed).length;

        const totalEligible = processedActivities.length;
        const totalCompleted = processedActivities.filter(act => act.completed).length;
        const rawCredits = Math.round(totalCompleted * 0.4 * 10) / 10;
        const groomingScore = totalEligible > 0 ? Math.round((totalCompleted / totalEligible) * 25 * 10) / 10 : 0;

        plan.rawCredits = rawCredits;
        plan.groomingScore = groomingScore;
        await plan.save();

        const petInfo = {
            petId: pet._id,
            petName: pet.petName,
            species: pet.species,
            breed: pet.breed,
            age: calculateAge(pet.dateOfBirth),
            gender: pet.gender,
            weight: pet.currentWeight ? `${pet.currentWeight.value} ${pet.currentWeight.unit || "kg"}` : "N/A",
            petPhoto: pet.petPhoto || ""
        };

        return res.json({
            success: true,
            pet: petInfo,
            planStartDate: plan.planStartDate,
            planEndDate: plan.planEndDate,
            currentWeekNum,
            todayDateStr,
            groomingProfile: plan.groomingProfile || {},
            monthlyPlanSummary: plan.monthlyPlanSummary || {},
            activities: processedActivities,
            todaysActivities: todaysActivities,
            todayProgress: {
                completed: todaysActivities.filter(a => a.completed).length,
                total: todaysActivities.length
            },
            weeklyProgress: {
                weekNumber: currentWeekNum,
                completed: weeklyCompleted,
                total: weeklyActivities.length,
                percentage: weeklyActivities.length > 0 ? Math.round((weeklyCompleted / weeklyActivities.length) * 100) : 0,
                rawCreditsEarned: Math.round(weeklyCompleted * 0.4 * 10) / 10
            },
            scoreSummary: {
                rawCredits: rawCredits,
                totalEligibleArrangements: totalEligible,
                completedEligibleArrangements: totalCompleted,
                groomingScore: groomingScore,
                maxScore: 25
            },
            completionHistory: plan.completionHistory || []
        });
    } catch (error) {
        console.error("Error fetching grooming plan:", error.message);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Failed to fetch grooming plan."
        });
    }
});

// =========================================================
// 5. COMPLETE GROOMING ACTIVITY (TODAY ONLY STRICT BACKEND ENFORCEMENT)
// =========================================================
router.post("/complete/:petId", protect, async (req, res) => {
    try {
        const userId = getUserId(req);
        const { petId } = req.params;
        const { activityId } = req.body;

        if (!activityId) {
            return res.status(400).json({ success: false, message: "activityId is required." });
        }

        const pet = await validatePetOwnership(petId, userId);
        const todayDateStr = getISTDateString();

        const plan = await GroomingPlan.findOne({ petId, status: "active" }).sort({ createdAt: -1 })
            || await GroomingPlan.findOne({ petId }).sort({ createdAt: -1 });
        if (!plan) {
            return res.status(404).json({ success: false, message: "Active grooming plan not found." });
        }

        const activity = plan.activities.find(act => act.activityId === activityId);
        if (!activity) {
            return res.status(404).json({ success: false, message: "Activity not found in monthly plan." });
        }

        // 1. ALREADY COMPLETED CHECK
        if (activity.completed) {
            return res.status(400).json({
                success: false,
                alreadyCompleted: true,
                message: "Activity already completed. No additional credit awarded.",
                rawCredits: plan.rawCredits,
                groomingScore: plan.groomingScore
            });
        }

        // 2. EXPIRED / PASSED DATE CHECK
        if (activity.date < todayDateStr) {
            return res.status(400).json({
                success: false,
                expired: true,
                message: `This activity date (${activity.date}) has passed and can no longer be completed. It has been marked as Failed/Missed (0 credit).`
            });
        }

        // 3. FUTURE DATE CHECK
        if (activity.date > todayDateStr) {
            return res.status(400).json({
                success: false,
                future: true,
                message: `This activity is scheduled for a future date (${activity.date}) and cannot be completed today.`
            });
        }

        // 4. AWARD CREDIT (ONLY IF DATE === TODAY)
        activity.completed = true;
        activity.completedAt = new Date();

        const historyEntry = {
            activityId: activity.activityId,
            activityName: activity.activityName,
            activityType: activity.activityType,
            date: activity.date || todayDateStr,
            rawCredit: 0.4,
            completedAt: new Date()
        };

        plan.completionHistory.unshift(historyEntry);

        const totalEligible = plan.activities.length;
        const totalCompleted = plan.activities.filter(act => act.completed).length;
        plan.rawCredits = Math.round(totalCompleted * 0.4 * 10) / 10;
        plan.groomingScore = totalEligible > 0 ? Math.round((totalCompleted / totalEligible) * 25 * 10) / 10 : 0;

        await plan.save();

        return res.json({
            success: true,
            message: `Completed "${activity.activityName}"! +0.4 Grooming Credit awarded.`,
            rawCreditEarned: 0.4,
            rawCredits: plan.rawCredits,
            groomingScore: plan.groomingScore,
            maxScore: 25,
            completedCount: totalCompleted,
            totalCount: totalEligible,
            activity
        });
    } catch (error) {
        console.error("Error completing activity:", error.message);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Failed to complete grooming activity."
        });
    }
});

// =========================================================
// 6. ADAPT GROOMING PLAN
// =========================================================
router.post("/adapt-plan/:petId", protect, async (req, res) => {
    try {
        const userId = getUserId(req);
        const { petId } = req.params;
        const { updatedCondition } = req.body;
        const pet = await validatePetOwnership(petId, userId);

        const plan = await GroomingPlan.findOne({ petId, status: "active" }).sort({ createdAt: -1 })
            || await GroomingPlan.findOne({ petId }).sort({ createdAt: -1 });
        if (!plan) {
            return res.status(404).json({ success: false, message: "No active plan to adapt." });
        }

        if (updatedCondition) {
            plan.petConditionNotes = updatedCondition;
        }

        const knowledge = getGroomingKnowledge(pet.species);
        const petDataForAi = {
            id: pet._id,
            petName: pet.petName,
            species: pet.species,
            breed: pet.breed,
            age: calculateAge(pet.dateOfBirth),
            updatedCondition: updatedCondition || plan.petConditionNotes
        };

        const aiResult = await generateGroomingPlan(petDataForAi, plan.groomingProfile, knowledge, plan.completionHistory);
        if (aiResult.summary) {
            plan.monthlyPlanSummary = aiResult.summary;
        }

        await plan.save();

        return res.json({
            success: true,
            message: "Grooming recommendations adapted to updated pet condition.",
            monthlyPlanSummary: plan.monthlyPlanSummary
        });
    } catch (error) {
        console.error("Error adapting grooming plan:", error.message);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Failed to adapt grooming plan."
        });
    }
});

module.exports = router;
