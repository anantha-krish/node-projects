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

const handleJwtError = () =>
  new AppErrors(401, 'Invalid token! Please login again');

const handleJwtExpiredError = () =>
  new AppErrors(401, 'Expired token! Please login again');

const sendErrorDev = (err, req, res) => {
  const isApiPath = req.originalUrl.startsWith('/api');
  if (isApiPath) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong! ',
    msg: err.message,
  });
};
const sendErrorProd = (err, req, res) => {
  const isApiPath = req.originalUrl.startsWith('/api');
  if (isApiPath) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Oops! something went wrong',
    });
  }
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong! ',
      msg: err.message,
    });
  }
  return res.status(500).render('error', {
    title: 'Something went wrong! ',
    msg: 'Please try again later',
  });
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') sendErrorDev(err, req, res);
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
      //handle JWT errors
    } else if (error.name === 'JsonWebTokenError') {
      error = handleJwtError();
    } else if (error.name === 'TokenExpiredError') {
      error = handleJwtExpiredError();
    }
    sendErrorProd(error, req, res);
  }

  //next not required
};
