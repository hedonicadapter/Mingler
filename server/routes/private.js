const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getPrivateData,
  getFriends,
} = require('../controllers/privateController');

router.route('/').get(protect, getPrivateData);

router.route('/getFriends').get(protect, getFriends);

module.exports = router;
