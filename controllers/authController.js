const User = require('../models/userModel');
const AppError = require('../utils/appError');
const { createJWT } = require('../config/jwtCreation.js');

const createUser = async (req, res, next) => {
  try {
    const foundUser = await User.findOne({ email: req.body.email });
    if (foundUser)
      return next(new AppError(`The user is already exists!`, 404));

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
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    // 1) check the existence of mail and password
    // 2) check if user exist with the same email and grab its password
    // 3) compare between the typing password and the one who saved to the DB
    const { email, password } = req.body;
    if (!email || !password)
      return next(
        new AppError(`Please provide both the email and password`, 400)
      );
    const user = await User.findOne({ email }).select('+password');

    if (
      !user ||
      !(await user.checkPasswordCorrectness(password, user.password))
    )
      return next(
        new AppError(
          `The User's Email: ${email} or password is not correct! try logging with different credentials`,
          401
        )
      );
    console.log(user._id);
    const token = createJWT(user?._id);
    res.status(200).json({
      staus: 'Success',
      data: { token },
    });
  } catch (err) {
    next(err);
  }
};

// get all users
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({
      status: 'Success',
      length: users.length,
      data: { users },
    });
  } catch (err) {
    next(err);
  }
};
// get single user
const getOneUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user)
      return next(
        new AppError(`The user requested with ${id} not found!`, 400)
      );
    res.status(200).json({
      status: 'Success',
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};
// delete User
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user)
      return next(new AppError(`No user found with id of ${id}.`, 400));
  } catch (err) {
    next(err);
  }
};

// update user
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user)
      return next(
        new AppError(`No user found with id of ${req.params.id}.`, 400)
      );
    res.status(200).json({
      status: 'Success',
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

const blockUser = async (req, res, next) => {
  try {
    console.log(req.params.id);
    const foundUser = await User.findOneAndUpdate(
      { _id: req.params.id },
      { isBlocked: true },
      { runValidators: true, new: true }
    );
    if (!foundUser)
      return next(
        new AppError(`The user with id of ${req.params.id} does not exist`, 400)
      );
    res.status(200).json({
      status: 'Sucess',
      message: 'User Blocked successfully',
    });
  } catch (err) {
    next(err);
  }
};

const unBlockUser = async (req, res, next) => {
  try {
    const foundUser = await User.findOneAndUpdate(
      { _id: req.params.id },
      { isBlocked: false },
      { runValidators: true, new: true }
    );
    if (!foundUser)
      return next(
        new AppError(`The user with id of ${req.params.id} does not exist`, 400)
      );
    res.status(200).json({
      status: 'Sucess',
      message: 'User unBlocked successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  blockUser,
  unBlockUser,
  createUser,
  login,
  getAllUsers,
  getOneUser,
  deleteUser,
  updateUser,
};
