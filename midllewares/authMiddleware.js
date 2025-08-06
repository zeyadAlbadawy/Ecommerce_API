const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const User = require('../models/userModel');

const verifyToken = async (req, res, next) => {
  // Get jwt token
  // verify token
  // get user of id of the decoded token
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token)
      return next(new AppError(`You are not logged in try again!`, 401));
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decoded.id;
    const foundUser = await User.findById(userId);
    if (!foundUser)
      return next(
        new AppError(`User with id of ${userId} is not currently Exists`, 400)
      );
    req.user = foundUser;
    next();
  } catch (err) {
    next(err);
  }
};

const checkAdmin = (req, res, next) => {
  if (req.user.role !== 'admin')
    return next(new AppError(`Only admins are allowed to do this action`, 401));
  next();
};
module.exports = { verifyToken, checkAdmin };
