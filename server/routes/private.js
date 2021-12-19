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
  getConversations,
  getMessages,
  sendMessage,
  authorizeSpotify,
  refreshSpotify,
  createSpotifyURL,
  saveMessengerCredentials,
} = require('../controllers/privateController');

router.route('/').get(protect, getPrivateData);

router.route('/searchUsers').post(protect, searchUsers);

router.route('/getFriends').post(getFriends);

router.route('/sendFriendRequest').post(protect, sendFriendRequest);
router.route('/acceptFriendRequest').post(protect, acceptFriendRequest);
router.route('/getFriendRequests').post(protect, getFriendRequests);
router.route('/getSentFriendRequests').post(protect, getSentFriendRequests);
router.route('/cancelFriendRequest').post(protect, cancelFriendRequest);

router.route('/getMessages').post(getMessages);
router.route('/sendMessage').post(sendMessage);

router.route('/createSpotifyURL').post(protect, createSpotifyURL);
router.route('/authorizeSpotify').post(protect, authorizeSpotify);
router.route('/refreshSpotify').post(protect, refreshSpotify);

router
  .route('/saveMessengerCredentials')
  .post(protect, saveMessengerCredentials);

module.exports = router;
