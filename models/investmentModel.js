const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InvestmentPlan',
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    profitEarned: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ['active', 'completed'],
      default: 'active',
    },

    startDate: {
      type: Date,
      default: Date.now,
    },

    endDate: {
      type: Date,
      required: true,
    },

    nextProfitTime: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const Investment = mongoose.model('Investment', investmentSchema);

module.exports = Investment;
