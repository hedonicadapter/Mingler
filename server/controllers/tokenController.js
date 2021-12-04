const mongoose = require('mongoose');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const RefreshToken = require('../models/RefreshToken');

exports.refreshToken = async (req, res, next) => {
  // console.log('body: ', req.body);
  // console.log('headers: ', req.headers);
  const { refreshToken } = req.body;

  try {
    const tokenExists = await RefreshToken.findOne(
      { refreshToken },
      async function (e, token) {
        if (e) return next(e);
        if (!token) {
          return next(new ErrorResponse('Invalid refresh token', 400));
        }

        const user = await User.findOne({
          _id: mongoose.Types.ObjectId(token.user),
        });

        if (!user) {
          return next(
            new ErrorResponse('No user with that refresh token', 401)
          );
        }

        sendToken(user, 200, res);

        return;
      }
    );
    return;
  } catch (e) {
    next(e);
  }
};

const sendToken = (user, statusCode, res) => {
  const token = user.getSignedToken();
  user.getRefreshToken().then(({ refreshToken }) => {
    // Idk why I'm making this check but maybe I could assign roles this way? lmao
    if (user.guest) {
      res.status(statusCode).json({
        success: true,
        token,
        refreshToken,
        _id: user._id,
        username: user.username,
      });
    } else {
      res.status(statusCode).json({
        success: true,
        token,
        refreshToken,
        _id: user._id,
        username: user.username,
      });
    }
  });
};
