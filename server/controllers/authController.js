const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');
const RefreshToken = require('../models/RefreshToken');

exports.signUpWithEmail = async (req, res, next) => {
  const { name, email, password, clientFingerprint } = req.body;

  if (!name) {
    return next(new ErrorResponse("We didn't receive a name.", 400));
  }

  if (!email) {
    return next(new ErrorResponse("We didn't receive an email.", 400));
  }

  if (!password) {
    return next(new ErrorResponse("We didn't receive a password.", 400));
  }

  const user = await User.findOne({
    email: email,
  });

  if (user) {
    return next(
      new ErrorResponse('There is already an account with this email.', 409)
    );
  }

  try {
    const user = await User.create({
      username: name,
      email,
      password: password,
      clientFingerprint,
    });

    sendToken(user, 201, res);
  } catch (e) {
    console.log(e);
    next(e);
  }
};

exports.signUpGuest = async (req, res, next) => {
  const { username, clientFingerprint } = req.body;

  if (!clientFingerprint) {
    return next(new ErrorResponse("We didn't receive an ID.", 400));
  }

  if (!username) {
    return next(new ErrorResponse("We didn't receive a username.", 400));
  }

  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(process.env.ANONYMOUS_PASSWORD, salt);

  if (!password) {
    return next(new ErrorResponse('Error processing password.', 500));
  }

  try {
    const user = await User.create({
      username,
      password,
      clientFingerprint,
      guest: true,
    });

    if (!user) {
      return next(new ErrorResponse('Error creating guest user.', 500));
    }

    sendToken(user, 201, res);
    return;
  } catch (e) {
    console.error(e);
    next(e);
  }
};

exports.signInRememberedUser = async (req, res, next) => {
  const { refreshToken } = req.body;

  try {
    await RefreshToken.findOne({ refreshToken }, async function (e, token) {
      if (e) return next(e);
      if (!token) {
        return next(new ErrorResponse('Invalid refresh token', 400));
      }

      const user = await User.findOne({
        _id: mongoose.Types.ObjectId(token.user),
      });

      if (!user) {
        return next(new ErrorResponse('No user with that refresh token', 401));
      }

      sendToken(user, 200, res);
    });
  } catch (e) {
    next(e);
  }
};
exports.signIn = async (req, res, next) => {
  const { email, password, clientFingerprint } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse('We need an email and a password.', 400));
  }

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new ErrorResponse('Invalid credentials.', 404));
    }

    const isMatch = await user.matchPasswords(password);

    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials.', 401));
    }

    user.clientFingerprint = clientFingerprint;
    // If user was set to 'Busy' for example during last use, set back to 'Busy'
    user.status = user.previousStatus;
    await user.save();

    sendToken(user, 200, res);
    return;
  } catch (e) {
    next(e);
  }
};

exports.signInGuest = async (req, res, next) => {
  const { guestID, clientFingerprint } = req.body;

  if (!guestID) {
    return next(new ErrorResponse("We didn't receive an ID.", 400));
  }

  if (!clientFingerprint) {
    return next(new ErrorResponse('Unfamiliar fingerprint.', 400));
  }

  try {
    const user = await User.findOne({
      _id: mongoose.Types.ObjectId(guestID.replace(/['"]+/g, '')),
      clientFingerprint,
    });

    if (!user) {
      return next(new ErrorResponse('Something went wrong.', 404));
    }

    user.clientFingerprint = clientFingerprint;
    await user.save();

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

    await user
      .save()
      .then()
      .catch((e) => next(e));

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

    await user
      .save()
      .then()
      .catch((e) => next(e));

    res.status(201).json({ success: true, data: 'Password reset successful.' });
  } catch (e) {
    next(e);
  }
};

const sendToken = (user, statusCode, res) => {
  const accessToken = user.getSignedToken();
  user.getRefreshToken().then(({ refreshToken }) => {
    // Idk why I'm making this check but maybe I could assign roles this way? lmao

    res.status(statusCode).json({
      success: true,
      accessToken,
      refreshToken,
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user?.profilePicture,
      guest: user.guest,
      spotifyAccessToken: user.spotifyAccessToken,
      spotifyRefreshToken: user.spotifyRefreshToken,
      spotifyExpiryDate: user.spotifyExpiryDate,
    });
  });
};
