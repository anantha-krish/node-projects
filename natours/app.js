const express = require('express');
const fs = require('fs');
//morgan gives us nice logging
const morgan = require('morgan');

const app = express();

//use middlewares
// by default, express won't append body to req object. Hence middleware support is needed

// 1) MIDDLEWARES
app.use(morgan('dev'));
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

//synchronous code outside of callback is non-blocking, will goto thread pool
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8')
);

/* app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello from app', app: 'Natours' });
});

app.post('/', (req, res) => {
  res.status(200).send('You can post data here');
}); */

// 2) Route Handlers
const getAllTours = (req, res) => {
  res.status(200).json(
    //JSend response structure
    {
      status: 'success',
      result: tours.length,
      data: {
        tours,
      },
    }
  );
};

const getTour = (req, res) => {
  //convert string to number
  const id = +req.params.id;
  const tour = tours.find((tour) => tour.id === id);
  if (!tour) {
    res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  res.status(200).json({
    status: 'success',
    //appended from middleware
    requestedAt: req.requestTime,
    data: {
      tour,
    },
  });
};
const createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;

  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  //use async version
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      //created
      res.status(201).json(newTour);
    }
  );
};

const getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'route not implemented yet',
  });
};

const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'route not implemented yet',
  });
};

const getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'route not implemented yet',
  });
};

const updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'route not implemented yet',
  });
};

const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'route not implemented yet',
  });
};

/*
app.get('/api/v1/tours', getAllTours);


app.get('/api/v1/tours/:id', getTour);

app.post('/api/v1/tours', createTour); */

// 3) API Routes

// creating multiple routers
const tourRouter = express.Router();
const userRouter = express.Router();

// defining paths
tourRouter.route('/').get(getAllTours).post(createTour);
tourRouter.route('/:id').get(getTour);

userRouter.route('/').get(getAllUsers).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

// mounting routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// 4) Start server
const port = 3000;
app.listen(port, () => {
  console.log(`Listening at localhost:${port}`);
});
