const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/User');
// const GuestUser = require('../models/GuestUser');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');

exports.register = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    const user = await User.create({ username, email, password });

    sendToken(user, 201, res);
  } catch (e) {
    next(e);
  }
};

exports.registerGuest = async (req, res, next) => {
  const { username } = req.body;

  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(process.env.ANONYMOUS_PASSWORD, salt);

  try {
    const user = await User.create({ username, password, guest: true });

    sendToken(user, 201, res);
  } catch (e) {
    console.log(e);
    next(e);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse('We need an email and a password.', 400));
  }

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new ErrorResponse('Invalid credentials1.', 404));
    }

    const isMatch = await user.matchPasswords(password);

    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials2.', 401));
    }

    sendToken(user, 200, res);

    return;
  } catch (e) {
    next(e);
  }
};

exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user)
      return next(new ErrorResponse(), 'Email could not be sent.', 404);

    const resetToken = user.getResetPasswordToken();

    await user.save();

    // Frontend url
    const resetUrl = 'http://localhost:8080/passwordreset/' + resetToken;

    const message = `
      <h1>Password reset request</h1>
      <a href=${resetUrl} clicktracking=off>Click to reset</a>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: 'ShareHub reset request',
        html: message,
      });

      res.status(200).json({ success: true, data: 'Email sent.' });
    } catch (e) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save();

      return next(new ErrorResponse('Email could not be sent.', 500));
    }
  } catch (e) {
    next(e);
  }
};

exports.resetPassword = async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return next(new ErrorResponse('Invalid reset token', 400));

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(201).json({ success: true, data: 'Password reset successful.' });
  } catch (e) {
    next(e);
  }
};

const sendToken = (user, statusCode, res) => {
  const token = user.getSignedToken();
  res.status(statusCode).json({ success: true, token });
};
