const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getPrivateData,
  getFriends,
} = require('../controllers/privateController');

router.route('/').get(protect, getPrivateData);

router.route('/getFriends').post(protect, getFriends);

module.exports = router;
