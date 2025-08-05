const User = require('../models/userModel');
const AppError = require('../utils/appError');

const createUser = async (req, res, next) => {
  try {
    const foundUser = await User.findOne({ email:req.body.email });
    if (foundUser) return next(new AppError(`The user is already exists!`, 404));

    const newUser = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      mobile: req.body.mobile,
    });

    res.status(201).json({
      status: 'Success',
      data: { newUser },
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

module.exports = { createUser };
