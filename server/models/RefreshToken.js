const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const RefreshTokenSchema = new mongoose.Schema({
  refreshToken: {
    type: String,
    required: [true, 'We need a refresh token'],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true,
  },
  created: { type: Date, default: new Date() },
});

const RefreshToken = mongoose.model('RefreshToken', RefreshTokenSchema);
module.exports = RefreshToken;
