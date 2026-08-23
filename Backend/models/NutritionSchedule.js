const mongoose = require("mongoose");

// =========================================================
// MEAL SCHEMA
// =========================================================

const nutritionMealSchema = new mongoose.Schema(
    {
        time: {
            type: String,
            required: true
        },

        mealName: {
            type: String,
            required: true
        },

        food: {
            type: String,
            required: true
        },

        portion: {
            type: String,
            default: ""
        },

        calories: {
            type: Number,
            default: 0
        },

        instructions: {
            type: String,
            default: ""
        },

        completed: {
            type: Boolean,
            default: false
        },

        completedAt: {
            type: Date,
            default: null
        }
    },
    {
        _id: true
    }
);


// =========================================================
// DAILY NUTRITION DAY
// =========================================================

const nutritionDaySchema = new mongoose.Schema(
    {
        // -----------------------------------------------------
        // DATE
        // -----------------------------------------------------

        date: {
            type: Date,
            required: true
        },


        // -----------------------------------------------------
        // MEALS
        // -----------------------------------------------------

        meals: {
            type: [nutritionMealSchema],
            default: []
        },


        // -----------------------------------------------------
        // WATER
        // -----------------------------------------------------

        waterTarget: {
            type: String,
            default: ""
        },

        waterCompleted: {
            type: Boolean,
            default: false
        },

        waterCompletedAt: {
            type: Date,
            default: null
        },


        // -----------------------------------------------------
        // TREATS
        // -----------------------------------------------------

        treatsAllowed: {
            type: Boolean,
            default: false
        },


        // -----------------------------------------------------
        // DAILY SCORE
        // -----------------------------------------------------

        dailyScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },


        // -----------------------------------------------------
        // DAILY STATUS
        // -----------------------------------------------------

        status: {
            type: String,
            enum: [
                "Pending",
                "Completed",
                "Failed"
            ],
            default: "Pending"
        },


        // -----------------------------------------------------
        // NUTRITION COMPLETION
        // -----------------------------------------------------

        completed: {
            type: Boolean,
            default: false
        },

        completedAt: {
            type: Date,
            default: null
        },


        // -----------------------------------------------------
        // FAILURE
        // -----------------------------------------------------

        failedAt: {
            type: Date,
            default: null
        },


        // -----------------------------------------------------
        // DAILY CREDIT
        // -----------------------------------------------------

        nutritionCredit: {
            type: Number,
            default: 0,
            min: 0,
            max: 0.4
        }
    },
    {
        _id: true
    }
);


// =========================================================
// NUTRITION SCHEDULE
// =========================================================

const nutritionScheduleSchema = new mongoose.Schema(
    {
        // -----------------------------------------------------
        // PET
        // -----------------------------------------------------

        petId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Pet",
            required: true,
            index: true
        },


        // -----------------------------------------------------
        // PLAN DATES
        // -----------------------------------------------------

        // Exact date on which owner submitted nutrition form
        // This becomes Day 1 of the nutrition schedule.

        planStartDate: {
            type: Date,
            required: true
        },

        // Day 30
        planEndDate: {
            type: Date,
            required: true
        },


        // -----------------------------------------------------
        // FORM SUBMISSION
        // -----------------------------------------------------

        nutritionFormSubmittedAt: {
            type: Date,
            required: true
        },


        // -----------------------------------------------------
        // GEMINI GENERATION
        // -----------------------------------------------------

        generatedAt: {
            type: Date,
            default: Date.now
        },

        generatedBy: {
            type: String,
            default: "Gemini"
        },

        knowledgeBaseVersion: {
            type: String,
            default: "1.0"
        },

        generationVersion: {
            type: String,
            default: "1.0"
        },


        // -----------------------------------------------------
        // 30 DAILY PLANS
        // -----------------------------------------------------

        days: {
            type: [nutritionDaySchema],
            default: []
        },


        // -----------------------------------------------------
        // PROGRESS
        // -----------------------------------------------------

        completedDays: {
            type: Number,
            default: 0,
            min: 0,
            max: 30
        },

        failedDays: {
            type: Number,
            default: 0,
            min: 0,
            max: 30
        },

        totalDays: {
            type: Number,
            default: 30
        },


        // -----------------------------------------------------
        // HEALTH CREDITS
        // -----------------------------------------------------

        nutritionCredits: {
            type: Number,
            default: 0,
            min: 0,
            max: 12
        },

        maxNutritionCredits: {
            type: Number,
            default: 12
        },

        creditPerCompletedDay: {
            type: Number,
            default: 0.4
        },


        // -----------------------------------------------------
        // PLAN STATUS
        // -----------------------------------------------------

        status: {
            type: String,
            enum: [
                "Active",
                "Completed",
                "Expired"
            ],
            default: "Active"
        }
    },
    {
        timestamps: true
    }
);


// =========================================================
// INDEXES
// =========================================================

// Find active schedules quickly for a pet.
nutritionScheduleSchema.index({
    petId: 1,
    status: 1
});

// Useful for finding schedules by start date.
nutritionScheduleSchema.index({
    petId: 1,
    planStartDate: 1
});


// =========================================================
// EXPORT
// =========================================================

module.exports = mongoose.model(
    "NutritionSchedule",
    nutritionScheduleSchema
);