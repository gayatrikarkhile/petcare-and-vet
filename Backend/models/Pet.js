const mongoose = require("mongoose");

const petSchema = new mongoose.Schema(
  {
    // ========================================
    // OWNER
    // ========================================

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },


    // ========================================
    // BASIC INFORMATION
    // ========================================

    petName: {
      type: String,
      required: true,
      trim: true
    },

    species: {
  type: String,
  required: true,
  enum: [
    "Dog",
    "Cat",
    "Bird",
    "Fish",
    "Rabbit",
    "Horse",
    "Turtle",
    "Other"
  ]
},

    breed: {
      type: String,
      required: true,
      trim: true
    },

    gender: {
      type: String,
      required: true,
      enum: [
        "Male",
        "Female"
      ]
    },
    reproductiveStatus: {
    type: String,
    enum: [
        "Intact",
        "Neutered",
        "Spayed",
        "Unknown",
        "Not Applicable"
    ],
    default: "Unknown"
},

    dateOfBirth: {
      type: Date,
      required: true
    },


    // ========================================
    // WEIGHT
    // ========================================

    currentWeight: {
      value: {
        type: Number,
        required: true,
        min: 0
      },

      unit: {
        type: String,
        enum: [
          "kg",
          "lbs"
        ],
        default: "kg"
      }
    },


    // ========================================
    // IDENTIFICATION
    // ========================================

    microchipId: {
      type: String,
      trim: true,
      default: ""
    },

    ownerPhone: {
      type: String,
      trim: true,
      default: ""
    },

    isLost: {
      type: Boolean,
      default: false
    },

    lostInfo: {
      lastSeenLocation: { type: String, default: "" },
      lostDate: { type: String, default: "" },
      note: { type: String, default: "" }
    },


    // ========================================
    // PET PHOTO
    // ========================================

    petPhoto: {
      type: String,
      default: ""
    },


   // ========================================
// MEDICAL CONDITIONS
// ========================================

medicalConditions: {
  type: [String],
  default: []
},


// ========================================
// NUTRITION PROFILE
// ========================================

nutritionProfile: {

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

  dietaryRestrictions: {
    type: [String],
    default: []
  },

  allergies: {
    type: [String],
    default: []
  },

  treatsAllowed: {
    type: Boolean,
    default: null
  },

  waterAccess: {
    type: String,
    default: ""
  },

  nutritionGoal: {
    type: String,
    default: ""
  },

  notes: {
    type: String,
    default: ""
  }

}

  },

  {
    timestamps: true
  }
);


module.exports = mongoose.model(
  "Pet",
  petSchema
);