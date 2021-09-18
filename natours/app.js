const express = require('express');

//morgan gives us nice logging
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppErrors = require('./utils/appErrors');
const globalErrorHandler = require('./controller/errorController');

const app = express();

// 1) MIDDLEWARES
//logging purpose
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// by default, express won't append body to req object. Hence middleware support is needed
app.use(express.json());
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
