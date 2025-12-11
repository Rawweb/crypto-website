const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema(
  {
    referralId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    referralCode: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Referral = mongoose.model('Referral', referralSchema);

module.exports = Referral;
