const express = require('express');
const userRouter = express.Router();
const authController = require('../controllers/authController.js');

userRouter.route('/createUser').post(authController.createUser);

module.exports = userRouter;
