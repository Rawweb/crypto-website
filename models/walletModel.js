const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    balance: {
      type: Number,
      default: 0,
    },

    profitBalance: {
      type: Number,
      default: 0,
    },

    referralBalance: {
      type: Number,
      default: 0,
    },

    usdtAddress: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;