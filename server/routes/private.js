const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getPrivateData,
  getFriends,
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  getSentFriendRequests,
  cancelFriendRequest,
  getFriendRequests,
  authorizeSpotify,
  refreshSpotify,
  createSpotifyURL,
} = require('../controllers/privateController');

router.route('/').get(protect, getPrivateData);

router.route('/searchUsers').post(protect, searchUsers);

router.route('/getFriends').post(protect, getFriends);

router.route('/sendFriendRequest').post(protect, sendFriendRequest);
router.route('/acceptFriendRequest').post(protect, acceptFriendRequest);
router.route('/getFriendRequests').post(protect, getFriendRequests);
router.route('/getSentFriendRequests').post(protect, getSentFriendRequests);
router.route('/cancelFriendRequest').post(protect, cancelFriendRequest);

router.route('/createSpotifyURL').post(protect, createSpotifyURL);
router.route('/authorizeSpotify').post(protect, authorizeSpotify);
router.route('/refreshSpotify').post(protect, refreshSpotify);

module.exports = router;
