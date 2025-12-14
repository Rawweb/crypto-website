const mongoose = require('mongoose');

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
      type: String, // HTML
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Page', pageSchema);
