// User to create the error 
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode || 500; // 404 or 500
    this.status = `${this.statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    // to not add this to the stack trace of the created object!
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
