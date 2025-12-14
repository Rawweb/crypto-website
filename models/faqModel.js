const mongoose = require('mongoose');

const faqVersionSchema = new mongoose.Schema(
  {
    question: String,
    answer: String,
    updatedAt: Date,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { _id: false }
);

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },

    answer: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },

    order: {
      type: Number,
      default: 0,
    },

    publishedAt: Date,

    versions: [faqVersionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Faq', faqSchema);
