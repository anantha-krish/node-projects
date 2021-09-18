const AppErrors = require('../utils/appErrors');

const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppErrors(400, message);
};

const handleDuplicateError = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value ${value}. Please enter another value!`;
  return new AppErrors(400, message);
};

const handleDBValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}.`;
  return new AppErrors(400, message);
};

const sendErrorDev = (err, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Oops! something went wrong',
    });
  }
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') sendErrorDev(err, res);
  if (process.env.NODE_ENV === 'production') {
    /** As name is in prototype */
    let error = Object.create(err);
    // handles invalid ID
    if (error.name === 'CastError') {
      error = handleCastError(error);
    }
    // handles duplicate entries
    else if (error.code === 11000) {
      error = handleDuplicateError(error);
    }
    // handles invalid entries
    else if (error.name === 'ValidationError') {
      error = handleDBValidationError(error);
    }
    sendErrorProd(error, res);
  }

  //next not required
};
