const User = require('../models/User');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
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
      const send = await User.findOneAndUpdate(
        { _id: toID },
        { $push: { friendRequests: fromID } },
        { session, new: true, safe: true, lean: true }
      );

      const sent = await User.findOneAndUpdate(
        { _id: fromID },
        { $push: { sentFriendRequests: toID } },
        { session, new: true, safe: true, lean: true }
      );

      if (!send) {
        console.log('Aborting friend request transaction, check send.');
        await session.abortTransaction();
      }
      if (!sent) {
        console.log('Aborting friend request transaction, check sent.');
        await session.abortTransaction();
      }
    });

    if (transactionResults) {
      return res.status(201).json({
        status: 'Success',
        data: transactionResults,
      });
    } else {
      return next(new ErrorResponse('Friend request transaction error', 500));
    }
  } catch (e) {
    next(e);
  } finally {
    await session.endSession();
  }
};

exports.acceptFriendRequest = async (req, res, next) => {
  const { fromID, userID } = req.body;

  const session = await User.startSession();

  try {
    const transactionResults = await session.withTransaction(async () => {
      const newFriend = await User.findOneAndUpdate(
        { _id: userID },
        { $push: { friends: fromID } },
        { session, new: true, safe: true, lean: true }
      );

      const send = await User.findOneAndUpdate(
        { _id: userID },
        { $pull: { friendRequests: fromID } },
        { session, new: true, safe: true, lean: true }
      );

      const sent = await User.findOneAndUpdate(
        { _id: fromID },
        { $pull: { sentFriendRequests: userID } },
        { session, new: true, safe: true, lean: true }
      );

      if (!newFriend) {
        console.log('Aborting accept request transaction, check newFriend.');
        await session.abortTransaction();
      }
      if (!send) {
        console.log('Aborting accept request transaction, check send.');
        await session.abortTransaction();
      }
      if (!sent) {
        console.log('Aborting accept request transaction, check sent.');
        await session.abortTransaction();
      }
    });

    if (transactionResults) {
      return res.status(201).json({
        status: 'Success',
        data: transactionResults,
      });
    } else {
      return next(new ErrorResponse('Accept request transaction error', 500));
    }
  } catch (e) {
    next(e);
  } finally {
    await session.endSession();
  }
};

exports.cancelFriendRequest = async (req, res, next) => {
  const { toID, fromID } = req.body;

  const session = await User.startSession();

  try {
    const transactionResults = await session.withTransaction(async () => {
      const send = await User.findOneAndUpdate(
        { _id: toID },
        { $pull: { friendRequests: fromID } },
        { session, new: true, safe: true, lean: true }
      );

      const sent = await User.findOneAndUpdate(
        { _id: fromID },
        { $pull: { sentFriendRequests: toID } },
        { session, new: true, safe: true, lean: true }
      );

      if (!send) {
        console.log('Aborting cancel request transaction, check send.');
        await session.abortTransaction();
      }
      if (!sent) {
        console.log('Aborting cancel request transaction, check sent.');
        await session.abortTransaction();
      }
    });

    if (transactionResults) {
      return res.status(201).json({
        status: 'Success',
        data: transactionResults,
      });
    } else {
      return next(new ErrorResponse('Cancel request transaction error', 500));
    }
  } catch (e) {
    next(e);
  } finally {
    await session.endSession();
  }
};

exports.getFriendRequests = async (req, res, next) => {
  const { userID } = req.body;

  try {
    await User.findOne({ _id: userID }, 'friendRequests')
      .populate('friendRequests', 'username _id')
      .exec(function (err, friends) {
        if (err) return next(new ErrorResponse('Database error'), 500);

        return res.send(friends);
      });
  } catch (e) {
    next(e);
  }
};

exports.getSentFriendRequests = async (req, res, next) => {
  const { userID } = req.body;

  try {
    await User.findOne(
      { _id: userID },
      'sentFriendRequests',
      function (err, result) {
        if (err) return next(new ErrorResponse('Database error'), 500);
        return res.send(result);
      }
    );
  } catch (e) {
    next(e);
  }
};
