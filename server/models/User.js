const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const RefreshToken = require('./RefreshToken');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'We need a username.'],
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
    minlength: [6, 'We need a longer password.'],
    select: false,
  },
  profilePicture: {
    image: { type: Buffer },
    mimetype: { type: String },
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
  conversations: [{ type: mongoose.Types.ObjectId, ref: 'Conversation' }],
  guest: { type: Boolean, default: false },
  // status: { type: String, default: 'offline' },
  online: { type: Boolean, default: false },
  previousStatus: { type: String, default: 'online' },
  clientFingerprint: String,
  created: { type: Date, default: new Date() },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  // TODO: Turn into separate collection
  spotifyAccessToken: String,
  spotifyRefreshToken: String,
  spotifyExpiryDate: Date,
});

UserSchema.pre('save', async function (next) {
  this.wasNew = this.isNew;

  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

UserSchema.post('save', async function (doc, next) {
  if (!this.wasNew) return next();

  try {
    const selfFriend = await User.findOneAndUpdate(
      { _id: this._id },
      { $push: { friends: this._id } },
      { new: true, safe: true, lean: true },
      (err, doc) => {
        if (err) next(err);
      }
    );

    if (!selfFriend) {
      next('Self befriending failed.');
    }
  } catch (e) {
    next(e);
  }

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

UserSchema.methods.getRefreshToken = async function () {
  const refreshToken = jwt.sign({ id: this._id }, process.env.JWT_SECRET);

  return await RefreshToken.findOneAndUpdate(
    { user: this._id },
    { user: this._id, refreshToken, created: new Date() },
    { upsert: true, new: true },
    function (err, doc) {
      if (err) return err;
      return;
    }
  ).select({ _id: 0, refreshToken: 1 });
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

User.collection.createIndex({ friends: 1 }, { sparse: true });
User.collection.createIndex({ friendRequests: 1 }, { sparse: true });
User.collection.createIndex({ sentFriendRequests: 1 }, { sparse: true });

module.exports = User;
