const express = require('express');
const router = express.Router();

const {
  register,
  login,
  forgotPassword,
  resetPassword,
  registerGuest,
} = require('../controllers/auth');

//If we hit /register as a route it will trigger the register function
router.route('/register').post(register);

router.route('/registerGuest').post(registerGuest);

router.route('/login').post(login);

router.route('/forgotPassword').post(forgotPassword);

router.route('/resetPassword/:resetToken').put(resetPassword);

module.exports = router;
