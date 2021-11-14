const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Bearer 3t0832thwg0wghw08t3fa
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return next(new ErrorResponse('Route unauthorized.', 401));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return next(
        new ErrorResponse('User with matching ID could not be found.', 404)
      );
    }

    req.user = user;

    next();
  } catch (e) {
    return next(new ErrorResponse('Route unauthorized.', 401));
  }
};
