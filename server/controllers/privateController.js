const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');

exports.getPrivateData = (req, res, next) => {
  res.status(200).json({
    success: true,
    data: 'Private data access',
  });
};

exports.getFriends = async (req, res, next) => {
  const { userID } = req.body;
  console.log(userID);

  try {
    User.findById(userID, 'friends', function (err, result) {
      if (err) return next(new ErrorResponse('Could not find friends.', 404));
      if (!result) return next(new ErrorResponse('Invalid body.', 400));

      User.find(
        { _id: { $in: result.friends } },
        {
          guest: 0,
          previousStatus: 0,
          clientFingerprint: 0,
          created: 0,
          resetPasswordToken: 0,
          resetPasswordExpire: 0,
        },
        function (err, friends) {
          if (err)
            return next(new ErrorResponse('Could not find friends.', 404));
          res.send(friends);
        }
      );
    });
  } catch (e) {
    next(e);
  }
};
