const User = require("../models/userModel");
const AppError = require("../utils/appError");
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
      status: "Success",
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
    const user = await User.findOne({ email }).select("+password");

    if (!user || !await (user.checkPasswordCorrectness(password, user.password)))
      return next(
        new AppError(
          `The User's Email: ${email} or password is not correct! try logging with different credentials`,
          401,
        ),
      );
    console.log(user._id);
    const token = createJWT(user?._id);
    res.status(200).json({
      staus: 'Success',
      data: { token }
    });
  } catch (err) {
    next(err)
  };
};

module.exports = { createUser, login };
