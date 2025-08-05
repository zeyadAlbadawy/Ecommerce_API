const express = require('express');
const userRouter = express.Router();
const authController = require('../controllers/authController.js');

userRouter.route('/register').post(authController.createUser);
userRouter.route('/login').post(authController.login);
module.exports = userRouter;
