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

  try {
    User.findById(userID, 'friends', function (err, result) {
      if (err) return next(new ErrorResponse('Could not find friends.', 404));
      if (!result) return next(new ErrorResponse('Invalid body.', 400));
      if (!result.friends) {
        return res.status(201).json({
          status: 'Success',
          message: 'No friends',
          data: null,
        });
      }

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

exports.searchUsers = async (req, res, next) => {
  const { searchTerm } = req.body;

  try {
    let result = await User.aggregate([
      {
        $search: {
          compound: {
            should: [
              {
                autocomplete: {
                  query: searchTerm,
                  path: 'username',
                  fuzzy: {
                    maxEdits: 2,
                  },
                },
              },
              {
                autocomplete: {
                  query: searchTerm,
                  path: 'email',
                  fuzzy: {
                    maxEdits: 2,
                  },
                },
              },
            ],
          },
        },
      },
    ]);

    res.send(result);
  } catch (e) {
    next(e);
  }
};

exports.sendFriendRequest = async (req, res, next) => {
  const { toID, fromID } = req.body;

  const session = await User.startSession();

  try {
    const transactionResults = await session.withTransaction(async () => {
      console.log(1);
      const send = await User.findOneAndUpdate(
        { _id: toID },
        { $push: { friendRequests: fromID } },
        { session, new: true, safe: true, lean: true }
      );

      console.log(2);
      const sent = await User.findOneAndUpdate(
        { _id: fromID },
        { $push: { sentFriendRequests: toID } },
        { session, new: true, safe: true, lean: true }
      );

      console.log(3);
      if (!send) {
        console.log('Aborting transaction, check send function.');
        await session.abortTransaction();
      }
      if (!sent) {
        console.log('Aborting transaction, check sent function.');
        await session.abortTransaction();
      }
      console.log(4);
    });

    if (transactionResults) {
      return res.status(201).json({
        status: 'Success',
        data: transactionResults,
      });
    } else {
      return next(new ErrorResponse('Transaction error', 500));
    }
  } catch (e) {
    next(e);
  } finally {
    await session.endSession();
  }

  // try {
  //   await User.findOneAndUpdate(
  //     { _id: toID },
  //     { $push: { friendRequests: fromID } },
  //     { new: true, safe: true, upsert: true, lean: true }
  //   )
  //     .then((result) => {
  //       return res.status(201).json({
  //         status: 'Success',
  //         data: result,
  //       });
  //     })
  //     .catch((error) => {
  //       return next(new ErrorResponse('Database error', 500));
  //     });
  // } catch (e) {
  //   next(e);
  // }
};

exports.getSentFriendRequests = async (req, res, next) => {
  const { userID } = req.body;

  try {
    await User.findOne(
      { _id: userID },
      'sentFriendRequests',
      function (err, result) {
        if (err) return next(new ErrorResponse('Database error'), 500);
        return res.status(201).json({
          status: 'Success',
          data: result,
        });
      }
    );
  } catch (e) {
    next(e);
  }
};
