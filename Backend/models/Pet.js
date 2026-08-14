const mongoose = require("mongoose");


const petSchema = new mongoose.Schema(

    {

        /* ==========================
           OWNER
        ========================== */

        ownerId: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "User",

            required: true

        },


        /* ==========================
           PET NAME
        ========================== */

        name: {

            type: String,

            required: true,

            trim: true

        },


        /* ==========================
           SPECIES
        ========================== */

        species: {

            type: String,

            required: true,

            trim: true

        },


        /* ==========================
           BREED
        ========================== */

        breed: {

            type: String,

            trim: true

        },


        /* ==========================
           GENDER
        ========================== */

        gender: {

            type: String,

            enum: [
                "Male",
                "Female"
            ]

        },


        /* ==========================
           DATE OF BIRTH
        ========================== */

        dateOfBirth: {

            type: Date

        },


        /* ==========================
           WEIGHT
        ========================== */

        weight: {

            type: Number,

            min: 0

        },


        /* ==========================
           WEIGHT UNIT
        ========================== */

        weightUnit: {

            type: String,

            enum: [
                "kg",
                "g",
                "lb"
            ],

            default: "kg"

        },


        /* ==========================
           PET IMAGE
        ========================== */

        image: {

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
        "Pet",
        petSchema
    );