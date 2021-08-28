const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getPrivateData,
  getFriends,
  searchUsers,
  sendFriendRequest,
  getSentFriendRequests,
  cancelFriendRequest,
} = require('../controllers/privateController');

router.route('/').get(protect, getPrivateData);

router.route('/getFriends').post(protect, getFriends);

router.route('/searchUsers').post(protect, searchUsers);

router.route('/sendFriendRequest').post(protect, sendFriendRequest);

router.route('/getSentFriendRequests').post(protect, getSentFriendRequests);

router.route('/cancelFriendRequest').post(protect, cancelFriendRequest);

module.exports = router;
