const mongoose = require('mongoose');

const savedAddressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    network: {
      type: String,
      required: true,
      enum: ['USDT_TRON', 'USDT_ETH', 'ETH', 'BTC'],
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// prevent duplicates
savedAddressSchema.index({ userId: 1, address: 1 }, { unique: true });

module.exports = mongoose.model('SavedAddress', savedAddressSchema);
