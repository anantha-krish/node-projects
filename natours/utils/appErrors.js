class AppErrors extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode || 500;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    //All AppErrors are handled or trusted errors (i.e. operational Errors)
    this.isOperational = true;
    //to avoid exposure of internal methods in Stacktrace
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppErrors;
