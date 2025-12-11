const mongoose = require('mongoose');

const referralBonusSchema = new mongoose.Schema(
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

    investmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Investment',
    },

    amount: {
      type: Number,
      required: true,
    },

    level: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

const ReferralBonus = mongoose.model('ReferralBonus', referralBonusSchema);

module.exports = ReferralBonus;
