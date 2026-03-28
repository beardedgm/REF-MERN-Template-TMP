const { User } = require('../models');
const AppError = require('../utils/AppError');

async function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return next(new AppError('Authentication required', 401));
  }

  const user = await User.findById(req.session.userId);
  if (!user) {
    req.session.destroy();
    return next(new AppError('Authentication required', 401));
  }

  req.user = user;
  next();
}

module.exports = { requireAuth };
