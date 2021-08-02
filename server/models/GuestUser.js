const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const GuestUserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'We need a username.'],
    },
    email: {
      type: String,
    },
    password: {
      type: String,
      required: [true, 'We need a password.'],
    },
    guest: { type: Boolean, default: true },
    created: { type: Date, default: new Date() },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { collection: 'users' }
);

GuestUserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
  // bcrypt.hash(this.password, 10, function (err, hash) {
  //   next();
  // });
});

GuestUserSchema.methods.matchPasswords = async function (password) {
  return await bcrypt.compare(password, this.password);
};

GuestUserSchema.methods.getSignedToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

GuestUserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpire = Date.now() + 10 * (60 * 1000); // 60*1000 = 1 minute, so 10 minutes

  return resetToken;
};

// const GuestUser = mongoose.model('GuestUser', GuestUserSchema);

// module.exports = GuestUser;
