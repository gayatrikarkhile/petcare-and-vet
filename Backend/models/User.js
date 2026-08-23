const mongoose = require("mongoose");


const userSchema = new mongoose.Schema(

    {

        name: {

            type: String,

            required: true,

            trim: true

        },


        email: {

            type: String,

            required: true,

            unique: true,

            lowercase: true,

            trim: true

        },


        phone: {

            type: String,

            trim: true

        },


        password: {
    type: String,
    required: false
},

authProvider: {

    type: String,

    enum: [
        "local",
        "google"
    ],

    default: "local"

},

profilePhoto: {
    type: String,
    default: ""
},

        role: {

            type: String,

            required: true,

            enum: [
                "owner",
                "vet",
                "admin"
            ]

        },


        /* ==========================
           EMAIL VERIFICATION
        ========================== */

        isEmailVerified: {

            type: Boolean,

            default: false

        },


        /* ==========================
           VET INFORMATION
        ========================== */

        clinicName: {

            type: String,

            trim: true

        },


        licenseNumber: {

            type: String,

            trim: true

        }

    },

    {

        timestamps: true

    }

);


module.exports =
    mongoose.model(
        "User",
        userSchema
    );