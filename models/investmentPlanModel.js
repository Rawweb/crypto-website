const mongoose = require('mongoose');

const investmentPlanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },

    minAmount: {
        type: Number,
        required: true,
    },

    maxAmount: {
        type: Number,
        required: true,
    },

    roi: {
        type: Number, // percentage return (e.g., 5 =>5%)
        required: true,
    },

    roiType: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        required: true,
    },

    profitDestination: {
        type: String,
        enum: ['main', 'profit'],
        default: 'main',
    },

    durationDays: {
        type: Number,
        required: true,
    },

    maxMultiplier: {
        type: Number,
        default: 3, // e.g. max total profit = 3x original amount
    },

    isActive: {
        type: Boolean,
        default: true,
    },

}, { timestamps: true });

const InvestmentPlan = mongoose.model('InvestmentPlan', investmentPlanSchema);

module.exports = InvestmentPlan;