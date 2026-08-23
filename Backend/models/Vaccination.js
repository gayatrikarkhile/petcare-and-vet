const mongoose = require("mongoose");

const vaccinationSchema = new mongoose.Schema(
    {
        petId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Pet",
            required: true
        },
        vetId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "VetProfile",
            default: null
        },
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
            default: null
        },
        vaccine: {
            type: String,
            required: true,
            trim: true
        },
        dateGiven: {
            type: Date,
            required: true
        },
        nextDue: {
            type: Date,
            required: true
        },
        doctor: {
            type: String,
            trim: true,
            default: "Not specified"
        },
        batchNumber: {
            type: String,
            default: "",
            trim: true
        },
        notes: {
            type: String,
            trim: true,
            default: ""
        },
        reminder: {
            type: Boolean,
            default: true
        },
        completed: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Vaccination",
    vaccinationSchema
);