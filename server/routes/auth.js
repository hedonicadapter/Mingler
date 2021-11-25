const express = require('express');
const router = express.Router();

const {
  login,
  forgotPassword,
  resetPassword,
  registerWithEmail,
  registerGuest,
  loginGuest,
} = require('../controllers/authController');

router.route('/registerWithEmail').post(registerWithEmail);

router.route('/registerGuest').post(registerGuest);

router.route('/login').post(login);

router.route('/loginGuest').post(loginGuest);

router.route('/forgotPassword').post(forgotPassword);

router.route('/resetPassword/:resetToken').put(resetPassword);

module.exports = router;
