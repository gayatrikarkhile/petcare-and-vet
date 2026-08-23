const mongoose = require("mongoose");

const ActivityScheduleItemSchema = new mongoose.Schema({
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
        required: true
    },
    category: {
        type: String,
        enum: ["physical_activity", "play", "mental_stimulation", "training"],
        required: true
    },
    activityName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    duration: {
        type: Number, // in minutes
        default: 20
    },
    creditValue: {
        type: Number,
        default: 0.4
    },
    status: {
        type: String,
        enum: ["scheduled", "completed", "failed"],
        default: "scheduled"
    },
    completedAt: {
        type: Date,
        default: null
    }
});

const ActivityHistoryItemSchema = new mongoose.Schema({
    activityId: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    activityName: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["completed", "failed"],
        required: true
    },
    creditValue: {
        type: Number,
        default: 0
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const ActivityPlanSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        petId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Pet",
            required: true,
            unique: true
        },
        planStartDate: {
            type: Date,
            required: true
        },
        planEndDate: {
            type: Date,
            required: true
        },
        activityProfile: {
            activityLevel: {
                type: String,
                enum: ["Very Low", "Low", "Moderate", "High", "Very High"],
                default: "Moderate"
            },
            energyLevel: {
                type: String,
                enum: ["Low", "Moderate", "High"],
                default: "Moderate"
            },
            lifestyle: {
                type: String,
                enum: ["Mostly Indoor", "Mostly Outdoor", "Mixed"],
                default: "Mixed"
            },
            currentRoutine: {
                type: [String],
                default: ["Walking", "Playing"]
            },
            favoriteActivities: {
                type: String,
                default: ""
            },
            dislikedActivities: {
                type: String,
                default: ""
            },
            environment: {
                type: String,
                default: "Park access & outdoor walking"
            },
            activityRestrictions: {
                type: String,
                default: ""
            },
            isProfileCompleted: {
                type: Boolean,
                default: false
            },
            updatedAt: {
                type: Date,
                default: Date.now
            }
        },
        schedule: [ActivityScheduleItemSchema],
        history: [ActivityHistoryItemSchema]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("ActivityPlan", ActivityPlanSchema);
