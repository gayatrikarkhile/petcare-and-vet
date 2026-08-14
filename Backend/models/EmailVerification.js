const mongoose = require("mongoose");


const emailVerificationSchema =
    new mongoose.Schema({

        email: {

            type: String,

            required: true,

            lowercase: true,

            trim: true,

            index: true

        },


        otp: {

            type: String,

            required: true

        },


        expiresAt: {

            type: Date,

            required: true

        }

    });


module.exports =
    mongoose.model(
        "EmailVerification",
        emailVerificationSchema
    );