const mongoose = require("mongoose");

const petQRSchema = new mongoose.Schema(
  {
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
      unique: true
    },
    qrToken: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    allowPhoneContact: {
      type: Boolean,
      default: true
    },
    allowWhatsappContact: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("PetQR", petQRSchema);
