const express = require('express');
const userRouter = express.Router();
const authController = require('../controllers/authController.js');
const authMiddleware = require('../midllewares/authMiddleware.js');
userRouter.route('/register').post(authController.createUser);
userRouter.route('/login').post(authController.login);
userRouter.route('/logout').post(authController.logout);
userRouter.route('/').get(authController.getAllUsers);
userRouter.route('/refresh').get(authController.handleRefreshToken);
userRouter
  .route('/:id')
  .get(
    authMiddleware.verifyToken,
    authMiddleware.checkAdmin,
    authController.getOneUser
  )
  .delete(authController.deleteUser)
  .patch(authMiddleware.verifyToken, authController.updateUser);
userRouter.route('/block-user/:id').get(authController.blockUser);
userRouter.route('/un-block-user/:id').get(authController.unBlockUser);
module.exports = userRouter;
