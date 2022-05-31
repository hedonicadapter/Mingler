const mongoose = require('mongoose');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const RefreshToken = require('../models/RefreshToken');

exports.refreshToken = async (req, res, next) => {
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

      return;
    });
    return;
  } catch (e) {
    next(e);
  }
};

const sendToken = (user, statusCode, res) => {
  const accessToken = user.getSignedToken();
  user.getRefreshToken().then(({ refreshToken }) => {
    res.status(statusCode).json({
      success: true,
      accessToken,
      refreshToken,
      _id: user._id,
      username: user.username,
      guest: user.guest,
    });
  });
};
