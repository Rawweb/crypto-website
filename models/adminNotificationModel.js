const mongoose = require('mongoose');

const adminNotificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'deposit',
        'withdrawal',
        'investment',
        'user',
        'system',
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    entityType: String, // 'deposit', 'withdrawal', 'user', etc
    entityId: mongoose.Schema.Types.ObjectId,

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  'AdminNotification',
  adminNotificationSchema
);
