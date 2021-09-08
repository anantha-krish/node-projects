const express = require('express');

//morgan gives us nice logging
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1) MIDDLEWARES
//logging purpose
app.use(morgan('dev'));
// by default, express won't append body to req object. Hence middleware support is needed
app.use(express.json());

//creating your own middleware
app.use((req, res, next) => {
  console.log('😁 hello from middleware');
  //important other wise req,res cyle won't continue
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //similary above body is appended in req using express.json
  next();
});

// mounting routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
