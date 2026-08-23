// =========================================================
// NUTRITION ROUTES
// =========================================================

const express = require("express");

const router = express.Router();


// =========================================================
// MODELS
// =========================================================

const Pet =
    require("../models/Pet");

const NutritionProfile =
    require("../models/NutritionProfile");

const NutritionSchedule =
    require("../models/NutritionSchedule");


// =========================================================
// AUTH
// =========================================================

const protect =
    require("../middleware/authMiddleware");


// =========================================================
// GEMINI
// =========================================================

const {
    prepareNutritionData,
    generateNutritionSchedule,
    testGemini
} =
    require("../services/geminiService");


// =========================================================
// KNOWLEDGE BASE
// =========================================================

const nutritionKnowledgeBase =
    require("../knowledgeBase/nutritionKnowledgeBase");


// =========================================================
// IST DATE HELPERS
// =========================================================

function getISTDateString(
    date = new Date()
) {

    return new Intl.DateTimeFormat(
        "en-CA",
        {
            timeZone:
                "Asia/Kolkata",

            year:
                "numeric",

            month:
                "2-digit",

            day:
                "2-digit"
        }
    ).format(date);

}


function getISTStartDate(
    date = new Date()
) {

    const dateString =
        getISTDateString(date);

    return new Date(
        `${dateString}T00:00:00+05:30`
    );

}


function getDayDifference(
    startDate,
    targetDate
) {

    const start =
        getISTStartDate(startDate);

    const target =
        getISTStartDate(targetDate);

    return Math.floor(
        (
            target.getTime() -
            start.getTime()
        ) /
        (
            24 *
            60 *
            60 *
            1000
        )
    );

}


// =========================================================
// SPECIES NORMALIZATION
// =========================================================

function getNutritionKnowledge(
    species
) {

    if (!species) {

        return {

            speciesKey:
                "Other",

            knowledge:
                nutritionKnowledgeBase.Other

        };

    }


    const normalized =
        String(species)
            .trim()
            .toLowerCase();


    const speciesMap = {

        // DOG
        dog:
            "Dog",

        dogs:
            "Dog",

        canine:
            "Dog",

        puppy:
            "Dog",


        // CAT
        cat:
            "Cat",

        cats:
            "Cat",

        feline:
            "Cat",

        kitten:
            "Cat",


        // BIRD
        bird:
            "Bird",

        birds:
            "Bird",

        lovebird:
            "Bird",

        parrot:
            "Bird",

        parakeet:
            "Bird",

        cockatiel:
            "Bird",

        avian:
            "Bird",


        // FISH
        fish:
            "Fish",

        fishes:
            "Fish",

        goldfish:
            "Fish",

        betta:
            "Fish",


        // RABBIT
        rabbit:
            "Rabbit",

        rabbits:
            "Rabbit",

        bunny:
            "Rabbit",

        hare:
            "Rabbit",


        // HORSE
        horse:
            "Horse",

        horses:
            "Horse",

        equine:
            "Horse",

        pony:
            "Horse",


        // TURTLE
        turtle:
            "Turtle",

        turtles:
            "Turtle",

        tortoise:
            "Turtle",

        terrapin:
            "Turtle",

        reptile:
            "Turtle",


        // OTHER
        other:
            "Other"

    };


    const knowledgeKey =
        speciesMap[normalized] || "Other";


    const knowledge =
        nutritionKnowledgeBase[knowledgeKey] ||
        nutritionKnowledgeBase.Other;


    return {

        speciesKey:
            knowledgeKey,

        knowledge:
            knowledge

    };

}



// =========================================================
// FIND USER PET
// =========================================================

async function findUserPet(
    petId,
    userId
) {

    return await Pet.findOne({

        _id:
            petId,

        ownerId:
            userId

    });

}


// =========================================================
// NORMALIZE GEMINI WATER
// =========================================================

function normalizeWater(
    water
) {

    // Gemini may return:
    //
    // water: {
    //    dailyTargetMl: 250,
    //    display: "250 ml/day",
    //    instructions: "..."
    // }
    //
    // OR it may return:
    //
    // water: "250 ml/day"


    if (
        water &&
        typeof water === "object"
    ) {

        const dailyTargetMl =
            Number(
                water.dailyTargetMl ||
                water.targetMl ||
                water.ml ||
                0
            );


        return {

            dailyTargetMl:
                dailyTargetMl,

            display:
                water.display ||
                (
                    dailyTargetMl > 0
                        ? `${dailyTargetMl} ml/day`
                        : "Fresh clean water available throughout the day."
                ),

            instructions:
                water.instructions ||
                "Keep fresh clean water available throughout the day."

        };

    }


    if (
        typeof water ===
        "number"
    ) {

        return {

            dailyTargetMl:
                water,

            display:
                `${water} ml/day`,

            instructions:
                "Keep fresh clean water available throughout the day."

        };

    }


    if (
        typeof water ===
        "string"
    ) {

        const match =
            water.match(
                /(\d+(?:\.\d+)?)\s*(?:ml|mL)/
            );


        const dailyTargetMl =
            match
                ? Number(match[1])
                : 0;


        return {

            dailyTargetMl:

                dailyTargetMl,

            display:
                water,

            instructions:
                "Keep fresh clean water available throughout the day."

        };

    }


    return {

        dailyTargetMl:
            0,

        display:
            "Fresh clean water available throughout the day.",

        instructions:
            "Keep fresh clean water available throughout the day."

    };

}


// =========================================================
// NORMALIZE GEMINI MEAL
// =========================================================

function normalizeMeal(
    meal,
    index
) {

    return {

        time:
            meal.time ||
            (
                index === 0
                    ? "08:00"
                    : index === 1
                        ? "13:00"
                        : "19:00"
            ),

        mealName:
            meal.mealName ||
            meal.mealType ||
            meal.meal ||
            `Meal ${index + 1}`,

        food:
            meal.food ||
            "As recommended",

        portion:
            meal.portion ||
            meal.amount ||
            "",

        calories:
            Number(
                meal.calories ||
                0
            ),

        instructions:
            meal.instructions ||
            meal.notes ||
            "",

        completed:
            false,

        completedAt:
            null

    };

}


// =========================================================
// NORMALIZE GEMINI DAY
// =========================================================

function normalizeDay(
    generatedDay,
    index,
    startDate,
    treatsAllowed
) {

    const dayDate =
        new Date(
            startDate
        );


    dayDate.setDate(
        dayDate.getDate() +
        index
    );


    const meals =
        Array.isArray(
            generatedDay.meals
        )
            ? generatedDay.meals.map(
                (
                    meal,
                    mealIndex
                ) =>
                    normalizeMeal(
                        meal,
                        mealIndex
                    )
            )
            : [];


    const water =
        normalizeWater(
            generatedDay.water ||
            generatedDay.waterTarget ||
            null
        );


    return {

        date:
            dayDate,

        meals:
            meals,

        waterTarget:
            water.display,

        waterTargetMl:
            water.dailyTargetMl,

        waterInstructions:
            water.instructions,

        waterCompleted:
            false,

        waterCompletedAt:
            null,

        treatsAllowed:
            generatedDay.treatsAllowed ??
            (
                treatsAllowed ===
                "Yes"
            ),

        dailyScore:
            0,

        status:
            "Pending",

        completed:
            false,

        completedAt:
            null,

        failedAt:
            null,

        nutritionCredit:
            0

    };

}


// =========================================================
// TEST GEMINI
//
// GET /api/nutrition/test-gemini
// =========================================================

router.get(
    "/test-gemini",
    protect,
    async (
        req,
        res
    ) => {

        try {

            const result =
                await testGemini();


            return res.status(200).json({

                success:
                    true,

                message:
                    "Gemini connection successful",

                response:
                    result

            });

        } catch (error) {

            console.error(
                "GEMINI TEST ERROR:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Gemini connection failed.",

                error:
                    error.message

            });

        }

    }
);


// =========================================================
// SAVE NUTRITION FORM + GENERATE MONTHLY PLAN
//
// POST /api/nutrition
// =========================================================

router.post(
    "/",
    protect,
    async (
        req,
        res
    ) => {

        try {

            const {

                petId,

                dietType,

                primaryFood,

                mealsPerDay,

                calorieTarget,

                allergies,

                dietaryRestrictions,

                treatsAllowed,

                waterAccess,

                nutritionGoal,

                speciesSpecific,

                notes

            } =
                req.body;


            // -------------------------------------------------
            // PET ID
            // -------------------------------------------------

            if (!petId) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Pet ID is required."

                });

            }


            // -------------------------------------------------
            // FIND PET
            // -------------------------------------------------

            const pet =
                await findUserPet(
                    petId,
                    req.user.userId
                );


            if (!pet) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "Pet not found."

                });

            }


            console.log(
                "=========================================="
            );

            console.log(
                "NUTRITION FORM SUBMITTED"
            );

            console.log(
                "PET:",
                pet.petName
            );

            console.log(
                "SPECIES:",
                pet.species
            );

            console.log(
                "PET ID:",
                pet._id
            );

            console.log(
                "DATE:",
                getISTDateString()
            );

            console.log(
                "=========================================="
            );


            // =================================================
            // SAVE NUTRITION PROFILE
            // =================================================

            const nutritionProfile =
                await NutritionProfile.findOneAndUpdate(

                    {
                        petId:
                            petId
                    },

                    {

                        petId:
                            petId,

                        dietType:
                            dietType ||
                            "",

                        primaryFood:
                            primaryFood ||
                            "",

                        mealsPerDay:
                            mealsPerDay ||
                            "",

                        calorieTarget:
                            calorieTarget ||
                            "",

                        allergies:
                            allergies ||
                            "",

                        dietaryRestrictions:
                            Array.isArray(
                                dietaryRestrictions
                            )
                                ? dietaryRestrictions
                                : [],

                        treatsAllowed:
                            treatsAllowed ||
                            "",

                        waterAccess:
                            waterAccess ||
                            "",

                        nutritionGoal:
                            nutritionGoal ||
                            "",

                        speciesSpecific:
                            speciesSpecific ||
                            {},

                        notes:
                            notes ||
                            ""

                    },

                    {

                        new:
                            true,

                        upsert:
                            true,

                        runValidators:
                            true

                    }

                );


            console.log(
                "✓ NUTRITION PROFILE SAVED"
            );


            // =================================================
            // CHECK ACTIVE PLAN
            // =================================================

            const existingSchedule =
                await NutritionSchedule.findOne({

                    petId:
                        petId,

                    status:
                        "Active"

                });


            if (existingSchedule) {

                console.log(
                    "Replacing existing active schedule for pet:",
                    pet.petName
                );

                await NutritionSchedule.updateMany(
                    {
                        petId: petId,
                        status: "Active"
                    },
                    {
                        $set: { status: "Replaced" }
                    }
                );

            }


            // =================================================
            // SPECIES KNOWLEDGE
            // =================================================

            const knowledgeResult =
                getNutritionKnowledge(
                    pet.species
                );


            if (!knowledgeResult) {

                return res.status(400).json({

                    success:
                        false,

                    profileSaved:
                        true,

                    scheduleGenerated:
                        false,

                    message:
                        `Nutrition knowledge base is not available for species "${pet.species}".`

                });

            }


            const knowledgeBase =
                knowledgeResult.knowledge;


            if (!knowledgeBase) {

                return res.status(400).json({

                    success:
                        false,

                    profileSaved:
                        true,

                    scheduleGenerated:
                        false,

                    message:
                        "Nutrition knowledge base is empty."

                });

            }


            // =================================================
            // PREPARE GEMINI DATA
            // =================================================

            console.log(
                "PREPARING GEMINI DATA..."
            );


            const preparedData =
                await prepareNutritionData(

                    pet.toObject
                        ? pet.toObject()
                        : pet,

                    nutritionProfile.toObject
                        ? nutritionProfile.toObject()
                        : nutritionProfile,

                    knowledgeBase

                );


            console.log(
                "✓ GEMINI DATA PREPARED"
            );


            // =================================================
            // GENERATE 30 DAYS
            // =================================================

            console.log(
                "GENERATING 30-DAY GEMINI PLAN..."
            );


            const generatedSchedule =
                await generateNutritionSchedule(

                    preparedData.pet,

                    preparedData.nutritionProfile,

                    preparedData.knowledgeBase

                );


            // =================================================
            // VALIDATE GEMINI
            // =================================================

            if (
                !generatedSchedule ||
                !Array.isArray(
                    generatedSchedule.days
                )
            ) {

                throw new Error(
                    "Gemini returned an invalid nutrition schedule."
                );

            }


            if (
                generatedSchedule.days.length !==
                30
            ) {

                throw new Error(

                    `Gemini returned ${generatedSchedule.days.length} days instead of 30.`

                );

            }


            console.log(
                "✓ GEMINI RETURNED 30 DAYS"
            );


            // =================================================
            // FORM SUBMISSION DATE = DAY 1
            // =================================================

            const formSubmittedAt =
                new Date();


            const startDate =
                getISTStartDate(
                    formSubmittedAt
                );


            // =================================================
            // DAY 30
            // =================================================

            const endDate =
                new Date(
                    startDate
                );


            endDate.setDate(
                endDate.getDate() +
                29
            );


            endDate.setHours(
                23,
                59,
                59,
                999
            );


            // =================================================
            // CREATE 30 DAYS
            // =================================================

            const days =
                generatedSchedule.days.map(

                    (
                        generatedDay,
                        index
                    ) =>
                        normalizeDay(

                            generatedDay,

                            index,

                            startDate,

                            treatsAllowed

                        )

                );


            // =================================================
            // CREATE SCHEDULE
            // =================================================

            const nutritionSchedule =
                new NutritionSchedule({

                    petId:
                        pet._id,

                    planStartDate:
                        startDate,

                    planEndDate:
                        endDate,

                    nutritionFormSubmittedAt:
                        formSubmittedAt,

                    generatedAt:
                        new Date(),

                    generatedBy:
                        "Gemini",

                    knowledgeBaseVersion:
                        "1.0",

                    generationVersion:
                        "1.0",

                    days:
                        days,

                    completedDays:
                        0,

                    failedDays:
                        0,

                    totalDays:
                        30,

                    nutritionCredits:
                        0,

                    maxNutritionCredits:
                        12,

                    creditPerCompletedDay:
                        0.4,

                    status:
                        "Active"

                });


            // =================================================
            // SAVE
            // =================================================

            await nutritionSchedule.save();


            console.log(
                "=========================================="
            );

            console.log(
                "✓ NUTRITION PLAN SAVED"
            );

            console.log(
                "PET:",
                pet.petName
            );

            console.log(
                "START:",
                getISTDateString(
                    startDate
                )
            );

            console.log(
                "END:",
                getISTDateString(
                    endDate
                )
            );

            console.log(
                "DAYS:",
                nutritionSchedule.days.length
            );

            console.log(
                "=========================================="
            );


            return res.status(201).json({

                success:
                    true,

                profileSaved:
                    true,

                scheduleGenerated:
                    true,

                message:
                    "Nutrition profile saved and personalized 30-day nutrition schedule generated successfully.",

                nutritionProfile:
                    nutritionProfile,

                schedule:
                    nutritionSchedule

            });

        } catch (error) {

            console.error(
                "=========================================="
            );

            console.error(
                "NUTRITION GENERATION ERROR"
            );

            console.error(
                error
            );

            console.error(
                "=========================================="
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Failed to save nutrition profile and generate schedule.",

                error:
                    error.message

            });

        }

    }
);


// =========================================================
// GET NUTRITION PROFILE
//
// GET /api/nutrition/:petId
// =========================================================

router.get(
    "/:petId",
    protect,
    async (
        req,
        res
    ) => {

        try {

            const {
                petId
            } =
                req.params;


            const pet =
                await findUserPet(
                    petId,
                    req.user.userId
                );


            if (!pet) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "Pet not found."

                });

            }


            const nutritionProfile =
                await NutritionProfile.findOne({

                    petId:
                        petId

                });


            return res.status(200).json({

                success:
                    true,

                nutritionProfile:
                    nutritionProfile ||
                    null

            });

        } catch (error) {

            console.error(
                "GET NUTRITION PROFILE ERROR:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Failed to get nutrition profile.",

                error:
                    error.message

            });

        }

    }
);


// =========================================================
// GET TODAY'S NUTRITION
//
// GET /api/nutrition/today/:petId
// =========================================================

router.get(
    "/today/:petId",
    protect,
    async (
        req,
        res
    ) => {

        try {

            const {
                petId
            } =
                req.params;


            const pet =
                await findUserPet(
                    petId,
                    req.user.userId
                );


            if (!pet) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "Pet not found."

                });

            }

            const nutritionProfile =
                await NutritionProfile.findOne({
                    petId: petId
                });

            const isProfileCompleted = Boolean(
                nutritionProfile &&
                (nutritionProfile.primaryFood || nutritionProfile.dietType) &&
                String(nutritionProfile.primaryFood || nutritionProfile.dietType || "").trim() !== ""
            );

            if (!isProfileCompleted) {
                return res.status(200).json({
                    success: false,
                    code: "PROFILE_INCOMPLETE",
                    profileIncomplete: true,
                    message: `${pet.petName}'s Nutrition profile is not completed yet. Please complete the Nutrition information before generating a personalized nutrition schedule.`,
                    pet: {
                        id: pet._id,
                        petName: pet.petName,
                        species: pet.species
                    }
                });
            }


            const schedule =
                await NutritionSchedule.findOne({

                    petId:
                        petId,

                    status:
                        "Active"

                });


            // -------------------------------------------------
            // NO ACTIVE PLAN
            // -------------------------------------------------

            if (!schedule) {

                return res.status(404).json({

                    success:
                        false,

                    planRequired:
                        true,

                    message:
                        "No active nutrition schedule found. Please fill the nutrition form to generate a new 30-day plan."

                });

            }


            // =================================================
            // TODAY
            // =================================================

            const today =
                getISTStartDate();


            const todayString =
                getISTDateString(
                    today
                );


            // =================================================
            // MARK MISSED DAYS
            // =================================================

            let changed =
                false;


            for (
                const day of schedule.days
            ) {

                if (!day.date) {

                    continue;

                }


                const dayString =
                    getISTDateString(
                        new Date(
                            day.date
                        )
                    );


                if (

                    dayString <
                        todayString &&

                    day.status !==
                        "Completed" &&

                    day.status !==
                        "Failed"

                ) {

                    day.status =
                        "Failed";

                    day.completed =
                        false;

                    day.completedAt =
                        null;

                    day.failedAt =
                        new Date();

                    day.nutritionCredit =
                        0;

                    changed =
                        true;

                }

            }


            // =================================================
            // UPDATE COUNTERS
            // =================================================

            if (changed) {

                schedule.completedDays =
                    schedule.days.filter(
                        day =>
                            day.status ===
                            "Completed"
                    ).length;


                schedule.failedDays =
                    schedule.days.filter(
                        day =>
                            day.status ===
                            "Failed"
                    ).length;


                schedule.nutritionCredits =
                    Math.min(

                        schedule.days.reduce(

                            (
                                total,
                                day
                            ) => {

                                return (
                                    total +
                                    (
                                        day.nutritionCredit ||
                                        0
                                    )
                                );

                            },

                            0

                        ),

                        schedule.maxNutritionCredits ||
                        12

                    );


                await schedule.save();

            }


            // =================================================
            // CHECK MONTH COMPLETION
            // =================================================

            if (

                schedule.completedDays +
                schedule.failedDays >=
                schedule.totalDays

            ) {

                schedule.status =
                    "Completed";


                await schedule.save();


                return res.status(200).json({

                    success:
                        true,

                    planCompleted:
                        true,

                    message:
                        "Your 30-day nutrition plan has been completed. Please fill the nutrition form to generate your next monthly plan.",

                    pet: {

                        id:
                            pet._id,

                        name:
                            pet.petName,

                        species:
                            pet.species,

                        breed:
                            pet.breed

                    },

                    schedule: {

                        completedDays:
                            schedule.completedDays,

                        failedDays:
                            schedule.failedDays,

                        totalDays:
                            schedule.totalDays,

                        nutritionCredits:
                            schedule.nutritionCredits,

                        maxNutritionCredits:
                            schedule.maxNutritionCredits,

                        status:
                            schedule.status

                    },

                    today:
                        null

                });

            }


            // =================================================
            // FIND TODAY
            // =================================================

            const todayPlan =
                schedule.days.find(
                    day => {

                        if (!day.date) {

                            return false;

                        }


                        return (

                            getISTDateString(
                                new Date(
                                    day.date
                                )
                            ) ===
                            todayString

                        );

                    }
                );


            if (!todayPlan) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "Today's nutrition plan was not found.",

                    planRequired:
                        false

                });

            }


            // =================================================
            // DAY NUMBER
            // =================================================

            const dayNumber =
                getDayDifference(

                    schedule.planStartDate,

                    today

                ) + 1;


            return res.status(200).json({

                success:
                    true,

                planCompleted:
                    false,

                pet: {

                    id:
                        pet._id,

                    name:
                        pet.petName,

                    species:
                        pet.species,

                    breed:
                        pet.breed

                },

                schedule: {

                    completedDays:
                        schedule.completedDays,

                    failedDays:
                        schedule.failedDays,

                    totalDays:
                        schedule.totalDays,

                    nutritionCredits:
                        schedule.nutritionCredits,

                    maxNutritionCredits:
                        schedule.maxNutritionCredits,

                    creditPerCompletedDay:
                        schedule.creditPerCompletedDay,

                    status:
                        schedule.status,

                    planStartDate:
                        schedule.planStartDate,

                    planEndDate:
                        schedule.planEndDate

                },

                today: {

                    ...todayPlan.toObject(),

                    dayNumber:
                        dayNumber

                }

            });

        } catch (error) {

            console.error(
                "GET TODAY NUTRITION ERROR:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Failed to load today's nutrition.",

                error:
                    error.message

            });

        }

    }
);


// =========================================================
// GET COMPLETE 30-DAY SCHEDULE
//
// GET /api/nutrition/schedule/:petId
// =========================================================

router.get(
    "/schedule/:petId",
    protect,
    async (
        req,
        res
    ) => {

        try {

            const {
                petId
            } =
                req.params;


            const pet =
                await findUserPet(
                    petId,
                    req.user.userId
                );


            if (!pet) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "Pet not found."

                });

            }


            const schedule =
                await NutritionSchedule.findOne({

                    petId:
                        petId,

                    status:
                        "Active"

                }).lean();


            if (!schedule) {

                return res.status(404).json({

                    success:
                        false,

                    planRequired:
                        true,

                    message:
                        "No active nutrition schedule found. Please fill the nutrition form to generate a new 30-day plan."

                });

            }


            return res.status(200).json({

                success:
                    true,

                planCompleted:
                    false,

                pet: {

                    id:
                        pet._id,

                    name:
                        pet.petName,

                    species:
                        pet.species,

                    breed:
                        pet.breed

                },

                schedule:
                    schedule

            });

        } catch (error) {

            console.error(
                "GET NUTRITION SCHEDULE ERROR:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Failed to get nutrition schedule.",

                error:
                    error.message

            });

        }

    }
);


// =========================================================
// COMPLETE TODAY'S NUTRITION
//
// POST /api/nutrition/complete/:petId
// =========================================================

router.post(
    "/complete/:petId",
    protect,
    async (
        req,
        res
    ) => {

        try {

            const {
                petId
            } =
                req.params;


            const pet =
                await findUserPet(
                    petId,
                    req.user.userId
                );


            if (!pet) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "Pet not found."

                });

            }


            const schedule =
                await NutritionSchedule.findOne({

                    petId:
                        petId,

                    status:
                        "Active"

                });


            if (!schedule) {

                return res.status(404).json({

                    success:
                        false,

                    planRequired:
                        true,

                    message:
                        "No active nutrition schedule found. Please fill the nutrition form first."

                });

            }


            const todayString =
                getISTDateString();


            const todayPlan =
                schedule.days.find(
                    day => {

                        if (!day.date) {

                            return false;

                        }


                        return (

                            getISTDateString(
                                new Date(
                                    day.date
                                )
                            ) ===
                            todayString

                        );

                    }
                );


            if (!todayPlan) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "Today's nutrition plan was not found."

                });

            }


            // =================================================
            // ALREADY COMPLETED
            // =================================================

            if (
                todayPlan.status ===
                "Completed"
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Today's nutrition is already completed."

                });

            }


            // =================================================
            // MISSED
            // =================================================

            if (
                todayPlan.status ===
                "Failed"
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Today's nutrition task has already failed."

                });

            }


            // =================================================
            // COMPLETE TODAY
            // =================================================

            todayPlan.status =
                "Completed";

            todayPlan.completed =
                true;

            todayPlan.completedAt =
                new Date();

            todayPlan.failedAt =
                null;

            todayPlan.nutritionCredit =
                schedule.creditPerCompletedDay ||
                0.4;


            // =================================================
            // UPDATE PROGRESS
            // =================================================

            schedule.completedDays =
                schedule.days.filter(
                    day =>
                        day.status ===
                        "Completed"
                ).length;


            schedule.failedDays =
                schedule.days.filter(
                    day =>
                        day.status ===
                        "Failed"
                ).length;


            schedule.nutritionCredits =
                Math.min(

                    schedule.days.reduce(

                        (
                            total,
                            day
                        ) => {

                            return (

                                total +
                                (
                                    day.nutritionCredit ||
                                    0
                                )

                            );

                        },

                        0

                    ),

                    schedule.maxNutritionCredits ||
                    12

                );


            // =================================================
            // CHECK MONTH
            // =================================================

            if (

                schedule.completedDays +
                schedule.failedDays >=
                schedule.totalDays

            ) {

                schedule.status =
                    "Completed";

            }


            await schedule.save();


            return res.status(200).json({

                success:
                    true,

                message:
                    "Today's nutrition completed successfully.",

                today:
                    todayPlan,

                progress: {

                    completedDays:
                        schedule.completedDays,

                    failedDays:
                        schedule.failedDays,

                    totalDays:
                        schedule.totalDays,

                    nutritionCredits:
                        schedule.nutritionCredits,

                    maxNutritionCredits:
                        schedule.maxNutritionCredits

                },

                planCompleted:
                    schedule.status ===
                    "Completed"

            });

        } catch (error) {

            console.error(
                "COMPLETE NUTRITION ERROR:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Failed to complete today's nutrition.",

                error:
                    error.message

            });

        }

    }
);


// =========================================================
// COMPLETE TODAY'S WATER
//
// POST /api/nutrition/water/:petId
// =========================================================

router.post(
    "/water/:petId",
    protect,
    async (
        req,
        res
    ) => {

        try {

            const {
                petId
            } =
                req.params;


            const pet =
                await findUserPet(
                    petId,
                    req.user.userId
                );


            if (!pet) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "Pet not found."

                });

            }


            const schedule =
                await NutritionSchedule.findOne({

                    petId:
                        petId,

                    status:
                        "Active"

                });


            if (!schedule) {

                return res.status(404).json({

                    success:
                        false,

                    planRequired:
                        true,

                    message:
                        "No active nutrition schedule found. Please fill the nutrition form first."

                });

            }


            const todayString =
                getISTDateString();


            const todayPlan =
                schedule.days.find(
                    day => {

                        if (!day.date) {

                            return false;

                        }


                        return (

                            getISTDateString(
                                new Date(
                                    day.date
                                )
                            ) ===
                            todayString

                        );

                    }
                );


            if (!todayPlan) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "Today's nutrition plan was not found."

                });

            }


            if (
                todayPlan.waterCompleted
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Today's water target is already completed."

                });

            }


            todayPlan.waterCompleted =
                true;

            todayPlan.waterCompletedAt =
                new Date();


            await schedule.save();


            return res.status(200).json({

                success:
                    true,

                message:
                    "Today's water target completed successfully.",

                waterCompleted:
                    true,

                waterCompletedAt:
                    todayPlan.waterCompletedAt

            });

        } catch (error) {

            console.error(
                "COMPLETE WATER ERROR:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Failed to complete today's water target.",

                error:
                    error.message

            });

        }

    }
);

router.post(
    "/generate-schedule/:petId",
    protect,
    async (req, res) => {

        try {

            const {
                petId
            } =
                req.params;


            const pet =
                await findUserPet(
                    petId,
                    req.user.userId
                );


            if (!pet) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "Pet not found."

                });

            }


            const existingSchedule =
                await NutritionSchedule.findOne({

                    petId:
                        petId,

                    status:
                        "Active"

                });


            if (existingSchedule) {

                return res.status(409).json({

                    success:
                        false,

                    message:
                        "This pet already has an active 30-day nutrition plan.",

                    schedule:
                        existingSchedule

                });

            }


            const nutritionProfile =
                await NutritionProfile.findOne({

                    petId:
                        petId

                });


            if (!nutritionProfile) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "Nutrition profile is not available yet."

                });

            }


            const knowledgeResult =
                getNutritionKnowledge(
                    pet.species
                );


            if (!knowledgeResult) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        `Nutrition knowledge base is not available for species "${pet.species}".`

                });

            }


            const knowledgeBase =
                knowledgeResult.knowledge;


            if (!knowledgeBase) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Nutrition knowledge base is empty."

                });

            }


            console.log(
                "GENERATING SCHEDULE VIA ENDPOINT FOR PET:",
                pet.petName
            );


            const preparedData =
                await prepareNutritionData(

                    pet.toObject
                        ? pet.toObject()
                        : pet,

                    nutritionProfile.toObject
                        ? nutritionProfile.toObject()
                        : nutritionProfile,

                    knowledgeBase

                );


            const generatedSchedule =
                await generateNutritionSchedule(

                    preparedData.pet,

                    preparedData.nutritionProfile,

                    preparedData.knowledgeBase

                );


            if (
                !generatedSchedule ||
                !Array.isArray(
                    generatedSchedule.days
                ) ||
                generatedSchedule.days.length !== 30
            ) {

                throw new Error(
                    "Gemini returned an invalid nutrition schedule."
                );

            }


            const formSubmittedAt =
                new Date();


            const startDate =
                getISTStartDate(
                    formSubmittedAt
                );


            const endDate =
                new Date(
                    startDate
                );


            endDate.setDate(
                endDate.getDate() +
                29
            );


            endDate.setHours(
                23,
                59,
                59,
                999
            );


            const days =
                generatedSchedule.days.map(

                    (
                        generatedDay,
                        index
                    ) =>
                        normalizeDay(

                            generatedDay,

                            index,

                            startDate,

                            nutritionProfile.treatsAllowed

                        )

                );


            await NutritionSchedule.updateMany(

                {
                    petId:
                        petId,

                    status:
                        "Active"
                },

                {
                    $set: {
                        status:
                            "Replaced"
                    }
                }

            );


            const nutritionSchedule =
                new NutritionSchedule({

                    petId:
                        pet._id,

                    planStartDate:
                        startDate,

                    planEndDate:
                        endDate,

                    nutritionFormSubmittedAt:
                        formSubmittedAt,

                    generatedAt:
                        new Date(),

                    generatedBy:
                        "Gemini",

                    knowledgeBaseVersion:
                        "1.0",

                    generationVersion:
                        "1.0",

                    days:
                        days,

                    completedDays:
                        0,

                    failedDays:
                        0,

                    totalDays:
                        30,

                    nutritionCredits:
                        0,

                    maxNutritionCredits:
                        12,

                    creditPerCompletedDay:
                        0.4,

                    status:
                        "Active"

                });


            await nutritionSchedule.save();


            return res.status(201).json({

                success:
                    true,

                scheduleGenerated:
                    true,

                message:
                    "Personalized 30-day nutrition schedule generated successfully.",

                schedule:
                    nutritionSchedule

            });


        } catch (error) {

            console.error(
                "GENERATE SCHEDULE ENDPOINT ERROR:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Failed to generate schedule.",

                error:
                    error.message

            });

        }

    }
);



// =========================================================
// EXPORT
// =========================================================

module.exports =
    router;