const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    proofImage: {
      type: String, // cloudinary URL
      required: true,
    },

    proofPublicId: {
      type: String,
      required: true,
      unique: true,
    },

    network: {
      type: String,
      enum: ['BTC', 'ETH', 'USDT'],
    },
    
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);
const Deposit = mongoose.model('Deposit', depositSchema);

module.exports = Deposit;
