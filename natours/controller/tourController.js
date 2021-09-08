const fs = require('fs');

//synchronous code outside of callback is non-blocking, will goto thread pool
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8')
);

exports.getAllTours = (req, res) => {
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

exports.getTour = (req, res) => {
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

exports.createTour = (req, res) => {
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
