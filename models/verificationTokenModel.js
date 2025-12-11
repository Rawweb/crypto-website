const mongoose = require('mongoose');

const verificationTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    token: {
      type: String,
      required: true,
    },

    purpose: {
      type: String,
      enum: ["emailVerification", "passwordReset"],
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('VerificationToken', verificationTokenSchema);
