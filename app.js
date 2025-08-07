const express = require('express');
const cookieParser = require('cookie-parser');
const userRouter = require('./routes/userRouter');
const app = express();
const AppError = require('./utils/appError.js');
const globalErrorHandler = require('./controllers/errorController.js');

// MIDDLEWARES
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Routers Middleware
app.use('/api/v1/users', userRouter);

app.all('/{*any}', (req, res, next) => {
  // If i pass anything to next it will propagate it to global error handling middleware
  next(new AppError(`Can not find ${req.originalUrl} on this server!`, 404));
});

// Error handling middleware
app.use(globalErrorHandler);

module.exports = app;
