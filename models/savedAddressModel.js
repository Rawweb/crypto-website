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

    label: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// prevent duplicate address per user per network
savedAddressSchema.index(
  { userId: 1, network: 1, address: 1 },
  { unique: true }
);

const SavedAddress = mongoose.model(
  'SavedAddress',
  savedAddressSchema
);

module.exports = SavedAddress;
