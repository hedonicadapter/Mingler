const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: function () {
      if (this.guest) return false;
      else return [true, 'We need a username.'];
    },
  },
  email: {
    type: String,
    required: function () {
      if (this.guest) return false;
      else return [true, 'We need an email.'];
    },
    trim: true,
    match: [
      /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/,
      'Invalid email.',
    ],
  },
  password: {
    type: String,
    required: [true, 'We need a password.'],
    minlength: 6,
    select: false,
  },
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
    },
  ],
  friendRequests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
    },
  ],
  sentFriendRequests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
    },
  ],
  guest: { type: Boolean, default: false },
  status: { type: String, default: 'offline' },
  previousStatus: { type: String, default: 'online' },
  clientFingerprint: String,
  created: { type: Date, default: new Date() },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPasswords = async function (password) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.methods.getSignedToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpire = Date.now() + 10 * (60 * 1000); // 60*1000 = 1 minute, so 10 minutes

  return resetToken;
};

const User = mongoose.model('User', UserSchema);

User.collection.createIndex('email', {
  unique: true,
  partialFilterExpression: {
    email: {
      $type: 'string',
    },
  },
});

// User.collection.dropIndexes(function (err, results) {
//   // Handle errors
// });
User.collection.createIndex({ friends: 1 }, { sparse: true });
User.collection.createIndex({ friendRequests: 1 }, { sparse: true });
User.collection.createIndex({ sentFriendRequests: 1 }, { sparse: true });

// User.collection.createIndex({ username: 'text', status: 'text' });

module.exports = User;
