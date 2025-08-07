const User = require('../models/userModel');
const AppError = require('../utils/appError');
const validateID = require('../utils/validateMongooseID.js');
const jwtCreation = require('../config/jwtCreation.js');
var jwt = require('jsonwebtoken');

const handleRefreshToken = async (req, res, next) => {
  // Get the refresh cookie from the cookies
  const cookie = req.cookies;
  if (!cookie?.refresJWTtoken)
    return next(new AppError(`the refresh token not found`, 404));

  // Find user with the refresh token
  const user = await User.findOne({ refreshedToken: cookie?.refresJWTtoken });
  if (!user)
    return next(
      new AppError(`the user with the refreshed token does not exist`, 404)
    );

  // verify the recieved token
  const decoded = jwt.verify(
    cookie?.refresJWTtoken,
    process.env.JWT_SECRET_KEY
  );
  if (user.id !== decoded.id)
    return next(
      new AppError(
        `There is something wrong with the refreshed token, try again`,
        400
      )
    );
  const acessedToken = jwtCreation.createJWT(user.id);
  res.status(200).json({ data: { token: acessedToken } });
};

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

const logout = async (req, res, next) => {
  try {
    const cookies = req.cookies;

    // 1) Check if refresh token cookie exists
    if (!cookies?.refreshJWTtoken) {
      res
        .status(204)
        .json({ status: 'No Content', message: 'No cookie found' });
      return;
    }

    const refreshToken = cookies.refreshJWTtoken;

    // 2) Find user by refresh token
    const user = await User.findOne({ refreshedToken: refreshToken });

    if (!user) {
      // 3) Clear the cookie even if user not found
      res.clearCookie('refreshJWTtoken', {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
      });
      return res
        .status(204)
        .json({ status: 'No Content', message: 'User not found' });
    }

    // 4) Remove refresh token from user
    user.refreshedToken = '';
    await user.save();

    // 5) Clear the cookie
    res.clearCookie('refreshJWTtoken', {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
    });

    res
      .status(204)
      .json({ status: 'Success', message: 'Logged out successfully' });
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
    if (!validateID.validateUserID(user._id))
      return next(
        new AppError(`This id can not be found or it is not found `, 404)
      );

    const token = jwtCreation.createJWT(user?._id);
    const refreshedToken = jwtCreation.refreshToken(user?._id);
    await User.findByIdAndUpdate(user.id, { refreshedToken }, { new: true });
    // This is used for authentication in the rendered websites
    res.cookie('refreshJWTtoken', refreshedToken, {
      httpOnly: true,
      sameSite: 'Strict', // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    // This is used for building the api inside postman forexample
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
    if (!validateID.validateUserID(id))
      return next(
        new AppError(`This id can not be found or it is not found `, 404)
      );

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
    if (!validateID.validateUserID(id))
      return next(
        new AppError(`This id can not be found or it is not found `, 404)
      );

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
  handleRefreshToken,
  blockUser,
  unBlockUser,
  createUser,
  login,
  logout,
  getAllUsers,
  getOneUser,
  deleteUser,
  updateUser,
};
