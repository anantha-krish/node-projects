const express = require('express');

//morgan gives us nice logging
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppErrors = require('./utils/appErrors');
const globalErrorHandler = require('./controller/errorController');

const app = express();

// 1) MIDDLEWARES

// Secure http headers
app.use(helmet());

//logging purpose
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
const limiter = rateLimit({
  max: 10,
  windowMs: 60 * 60 * 1000, //1hr
  message: 'Too many request sent. Please try again after 1 hr',
});
//only use rate limits for apis
app.use('/api', limiter);

// by default, express won't append body to req object. Hence middleware support is needed
app.use(express.json({ limit: '10kb' }));

// Prevent NOSQL injection
app.use(mongoSanitize());
//Prevent XSS
app.use(xss());

//Prevent Parameter pollution (Duplicate Param query)
app.use(
  hpp({
    whitelist: [
      //allow duplicate parameters for below items
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'duration',
      'maxGroupSize',
      'difficulty',
    ],
  })
);

//serving static files
app.use(express.static(`${__dirname}/public`));
//creating your own middleware
/* app.use((req, res, next) => {
  console.log('😁 hello from middleware');
  //important other wise req,res cyle won't continue
  next();
}); */

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //similary above body is appended in req using express.json
  next();
});

// mounting routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//fallback route
app.use('*', (req, res, next) => {
  const appError = new AppErrors(
    404,
    `Server does not support ${req.originalUrl}`
  );

  // pass on the error object to next middleware and stop req-res cycle
  next(appError);
});

/** Error Handling middleware */
app.use(globalErrorHandler);

module.exports = app;
