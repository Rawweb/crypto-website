const mongoose = require('mongoose');

const pageVersionSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    updatedAt: Date,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { _id: false }
);

const pageSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    title: {
      type: String,
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },

    publishedAt: Date,

     isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: Date,

    versions: [pageVersionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Page', pageSchema);
