const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email address',
      ],
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
    },

    referralCode: {
      type: String,
    },

    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    status: {
      type: String,
      enum: ['active', 'suspended', 'banned'],
      default: 'active',
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
