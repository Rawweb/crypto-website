const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema ( {
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    amount: {
        type: Number,
        required: true,
    },

    walletAddress: {
        type: String,   
        required: true,
    },

    status: {
        type: String,
        enum: ['pending', 'processed', 'rejected'],
        default: 'pending',
    },
}, { timestamps: true });

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);

module.exports = Withdrawal;