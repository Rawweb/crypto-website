const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: String,
    message: String,
    targetPage: {
      type: String, // home, dashboard, all
      default: 'all',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Banner', bannerSchema);
