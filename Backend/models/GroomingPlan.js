const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
    activityId: {
        type: String,
        required: true
    },
    date: {
        type: String, // YYYY-MM-DD
        required: true
    },
    dayNumber: {
        type: Number,
        required: true
    },
    weekNumber: {
        type: Number,
        required: true,
        min: 1,
        max: 4
    },
    dayOfWeek: {
        type: String,
        default: ""
    },
    activityType: {
        type: String,
        required: true,
        enum: [
            "coat_care",
            "brushing",
            "bathing",
            "nail_care",
            "ear_care",
            "paw_care",
            "dental_care"
        ]
    },
    activityName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    creditValue: {
        type: Number,
        default: 0.4
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date,
        default: null
    }
});

const completionHistorySchema = new mongoose.Schema({
    activityId: {
        type: String,
        required: true
    },
    activityName: {
        type: String,
        required: true
    },
    activityType: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    rawCredit: {
        type: Number,
        default: 0.4
    },
    completedAt: {
        type: Date,
        default: Date.now
    }
});

const groomingPlanSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        petId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Pet",
            required: true
        },
        planStartDate: {
            type: String, // YYYY-MM-DD (rolling start date)
            required: true
        },
        planEndDate: {
            type: String, // YYYY-MM-DD (rolling end date, +29 days)
            required: true
        },
        status: {
            type: String,
            enum: ["active", "expired", "archived"],
            default: "active"
        },
        month: {
            type: Number,
            required: true,
            min: 1,
            max: 12
        },
        year: {
            type: Number,
            required: true
        },
        groomingProfile: {
            coatType: { type: String, default: "" },
            hairLength: { type: String, default: "" },
            sheddingLevel: { type: String, default: "" },
            skinCondition: { type: String, default: "" },
            currentCondition: { type: String, default: "" },
            brushingFrequency: { type: String, default: "" },
            bathingFrequency: { type: String, default: "" },
            nailTrimmingFrequency: { type: String, default: "" },
            earCleaningFrequency: { type: String, default: "" },
            pawCareRoutine: { type: String, default: "" },
            lastGroomingSession: { type: String, default: "" },
            currentGroomingRoutine: { type: String, default: "" },
            productsUsed: { type: String, default: "" },
            previousActivities: { type: String, default: "" },
            groomingConcerns: { type: String, default: "" },
            specialRequirements: { type: String, default: "" },

            // Dental Information (Sub-category of Grooming)
            toothBrushingFrequency: { type: String, default: "" },
            dentalHygieneRoutine: { type: String, default: "" },
            dentalChews: { type: String, default: "" },
            dentalToys: { type: String, default: "" },
            currentDentalCondition: { type: String, default: "" },
            plaqueObservations: { type: String, default: "" },
            gumObservations: { type: String, default: "" },
            lastDentalCleaning: { type: String, default: "" },
            dentalConcerns: { type: String, default: "" }
        },
        petConditionNotes: {
            type: String,
            default: ""
        },
        monthlyPlanSummary: {
            goal: { type: String, default: "Personalized Monthly Grooming & Dental Maintenance" },
            recommendationNotes: { type: String, default: "" },
            specialConsiderations: { type: [String], default: [] }
        },
        activities: [activitySchema],
        completionHistory: [completionHistorySchema],
        rawCredits: {
            type: Number,
            default: 0
        },
        groomingScore: {
            type: Number,
            default: 0,
            max: 25
        }
    },
    {
        timestamps: true
    }
);

const GroomingPlan = mongoose.model("GroomingPlan", groomingPlanSchema);

// Safely drop old unique index if it exists in MongoDB database
GroomingPlan.collection.dropIndex("petId_1_year_1_month_1").catch(() => {
    // Ignore if index doesn't exist or already dropped
});

module.exports = GroomingPlan;
