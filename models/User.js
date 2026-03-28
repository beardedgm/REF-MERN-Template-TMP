const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    stripeCustomerId: {
      type: String,
      default: null,
    },
    plan: {
      type: String,
      enum: ['free', 'pro'],
      default: 'free',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
