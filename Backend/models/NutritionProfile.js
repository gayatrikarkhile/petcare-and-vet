const mongoose = require("mongoose");

const nutritionProfileSchema =
    new mongoose.Schema(
        {

            // =========================================
            // PET
            // =========================================

            petId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Pet",
                required: true,
                unique: true
            },


            // =========================================
            // COMMON NUTRITION INFORMATION
            // =========================================

            dietType: {
                type: String,
                default: ""
            },

            primaryFood: {
                type: String,
                default: ""
            },

            mealsPerDay: {
                type: Number,
                default: null
            },

            calorieTarget: {
                type: Number,
                default: null
            },


            // =========================================
            // ALLERGIES & RESTRICTIONS
            // =========================================

            allergies: {
                type: String,
                default: ""
            },

            dietaryRestrictions: {
                type: [String],
                default: []
            },


            // =========================================
            // TREATS & WATER
            // =========================================

            treatsAllowed: {
                type: String,
                default: ""
            },

            waterAccess: {
                type: String,
                default: ""
            },


            // =========================================
            // NUTRITION GOAL
            // =========================================

            nutritionGoal: {
                type: String,
                default: ""
            },


            // =========================================
            // SPECIES-SPECIFIC ANSWERS
            // =========================================

            speciesSpecific: {
                type: mongoose.Schema.Types.Mixed,
                default: {}
            },


            // =========================================
            // ADDITIONAL NOTES
            // =========================================

            notes: {
                type: String,
                default: ""
            }

        },

        {
            timestamps: true
        }
    );


module.exports =
    mongoose.model(
        "NutritionProfile",
        nutritionProfileSchema
    );