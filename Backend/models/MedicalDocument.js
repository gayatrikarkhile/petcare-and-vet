const mongoose = require("mongoose");

const medicalDocumentSchema = new mongoose.Schema(
    {
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        petId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Pet",
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        type: {
            type: String,
            enum: [
                "vaccination",
                "medical",
                "prescription",
                "lab",
                "other"
            ],
            default: "other"
        },

        doctor: {
            type: String,
            trim: true,
            default: ""
        },

        documentDate: {
            type: Date,
            default: null
        },

        fileUrl: {
            type: String,
            required: true
        },

        cloudinaryPublicId: {
            type: String,
            default: ""
        },

        fileType: {
            type: String,
            required: true
        },

        fileSize: {
            type: Number,
            default: 0
        },

        description: {
            type: String,
            trim: true,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "MedicalDocument",
    medicalDocumentSchema
);