const mongoose = require('mongoose');

const transactionalLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    type: {
      type: String,
      enum: ['deposit', 'withdrawal', 'profit', 'adjustment'],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    description: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const TransactionalLog = mongoose.model('TransactionalLog', transactionalLogSchema);

module.exports = TransactionalLog;
