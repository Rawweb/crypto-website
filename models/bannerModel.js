const mongoose = require('mongoose');

const bannerVersionSchema = new mongoose.Schema(
  {
    title: String,
    message: String,
    targetPage: String,
    updatedAt: Date,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { _id: false }
);

const bannerSchema = new mongoose.Schema(
  {
    title: String,
    message: String,

    targetPage: {
      type: String,
      default: 'all',
    },

    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },

    publishedAt: Date,

    versions: [bannerVersionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Banner', bannerSchema);
