const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getPrivateData,
  getFriends,
  searchUsers,
  sendFriendRequest,
} = require('../controllers/privateController');

router.route('/').get(protect, getPrivateData);

router.route('/getFriends').post(protect, getFriends);

router.route('/searchUsers').post(protect, searchUsers);

router.route('/sendFriendRequest').post(protect, sendFriendRequest);

module.exports = router;
