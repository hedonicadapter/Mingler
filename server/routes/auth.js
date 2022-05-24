const express = require('express');
const router = express.Router();

const {
  signIn,
  signInRememberedUser,
  forgotPassword,
  resetPassword,
  signUpWithEmail,
  signUpGuest,
  signInGuest,
} = require('../controllers/authController');

router.route('/signUpWithEmail').post(signUpWithEmail);

router.route('/signUpGuest').post(signUpGuest);

router.route('/signIn').post(signIn);

router.route('/signInRememberedUser').post(signInRememberedUser);

router.route('/signInGuest').post(signInGuest);

router.route('/forgotPassword').post(forgotPassword);

router.route('/resetPassword/:resetToken').put(resetPassword);

module.exports = router;
