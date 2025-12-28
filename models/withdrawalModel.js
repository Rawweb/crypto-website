const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    network: {
      type: String,
      required: true,
      enum: ['USDT_TRON', 'USDT_ETH', 'ETH', 'BTC'],
    },

    walletAddress: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ['pending', 'processed', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

/* =========================
   NETWORK-BASED VALIDATION
========================= */
withdrawalSchema.pre('validate', function () {
  const patterns = {
    USDT_TRON: /^T[a-zA-Z0-9]{33}$/,
    USDT_ETH: /^0x[a-fA-F0-9]{40}$/,
    ETH: /^0x[a-fA-F0-9]{40}$/,
    BTC: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
  };

  const regex = patterns[this.network];

  if (!regex || !regex.test(this.walletAddress)) {
    throw new Error('Invalid wallet address for selected network');
  }
});


// indexc for fast admin queries
withdrawalSchema.index({ status: 1, createdAt: -1 });

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);

module.exports = Withdrawal;
