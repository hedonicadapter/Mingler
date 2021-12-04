const express = require('express');
const router = express.Router();

const { refreshToken } = require('../controllers/tokenController');

router.route('/refreshToken').post(refreshToken);

module.exports = router;
