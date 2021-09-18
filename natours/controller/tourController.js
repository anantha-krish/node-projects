const Tours = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const AppErrors = require('../utils/appErrors');
const catchAsyncErrors = require('../utils/catchAsyncErrors');

exports.top5cheapTours = catchAsyncErrors(async (req, res, next) => {
  req.query.sort = '-ratingsAverage,price';
  req.query.limit = 5;
  req.query.fields = 'name,description,summary,price,ratingsAverage';
  next();
});

exports.getAllTours = catchAsyncErrors(async (req, res, next) => {
  const features = new APIFeatures(Tours.find(), req.query)
    .filter()
    .sort()
    .limit()
    .paginate();

  const tours = await features.query;

  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: {
      tours,
    },
  });
});

exports.getTour = catchAsyncErrors(async (req, res, next) => {
  const tour = await Tours.findById(req.params.id);
  if (!tour) {
    return next(new AppErrors(404, `tour with id ${req.params.id} not found`));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.createTour = catchAsyncErrors(async (req, res, next) => {
  const result = await Tours.create(req.body);
  res.status(201).json({
    status: 'success',
    //appended from middleware
    requestedAt: req.requestTime,
    data: { result },
  });
});

exports.updateTour = catchAsyncErrors(async (req, res, next) => {
  const updatedTour = await Tours.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!updatedTour) {
    return next(new AppErrors(404, `tour with id ${req.params.id} not found`));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour: updatedTour,
    },
  });
});

exports.deleteTour = catchAsyncErrors(async (req, res, next) => {
  const tour = await Tours.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppErrors(404, `tour with id ${req.params.id} not found`));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getTourStats = catchAsyncErrors(async (req, res, next) => {
  const stats = await Tours.aggregate([
    //similar to where condition
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      // similar to group by
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      // order by fieldname (+ve Ascencding, -ve descending)
      $sort: { avgRating: -1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getTourPlan = catchAsyncErrors(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tours.aggregate([
    //JOIN logic
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        //add to array
        tours: { $push: '$name' },
      },
    },
    //add new fields
    { $addFields: { month: '$_id' } },
  ]);

  res.status(200).json({
    status: 'success',
    result: plan.length,
    data: {
      plan,
    },
  });
});
