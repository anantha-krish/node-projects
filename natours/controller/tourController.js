const multer = require('multer');
const sharp = require('sharp');
const Tours = require('../models/tourModel');
const AppErrors = require('../utils/appErrors');

const catchAsyncErrors = require('../utils/catchAsyncErrors');
const factory = require('./handlerFactory');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, callback) => {
  if (file.mimetype.startsWith('image')) {
    return callback(null, true);
  }
  return callback(new AppErrors(400, 'Please upload an image file'), false);
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
/* 
 use this when you need only one field
 exports.uploadTourImages = upload.array('images', 3); */

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourImages = async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();
  /** Cover Image Processing */
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  /** Tour Images Processing */
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (image, i) => {
      const fileName = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(image.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${fileName}`);
      req.body.images.push(fileName);
    })
  );
  next();
};

exports.top5cheapTours = catchAsyncErrors(async (req, res, next) => {
  req.query.sort = '-ratingsAverage,price';
  req.query.limit = 5;
  req.query.fields = 'name,description,summary,price,ratingsAverage';
  next();
});
//   /tours-within/:distance/center/:latlng/unit/:unit
//  /tours-within/233/center/-45,51/unit/mi
exports.toursWithin = catchAsyncErrors(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    next(new AppErrors(404, 'Please provide coordinates in lat,lng format'));
  }

  const tours = await Tours.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.toursNearby = catchAsyncErrors(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(new AppErrors(404, 'Please provide coordinates in lat,lng format'));
  }

  const distances = await Tours.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [+lng, +lat] },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        name: 1,
        distance: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});

exports.getAllTours = factory.getAll(Tours);

exports.getTour = factory.getOne(Tours, { path: 'reviews' });

exports.createTour = factory.createOne(Tours);
exports.updateTour = factory.updateOne(Tours);
exports.deleteTour = factory.deleteOne(Tours);

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
/* catchAsyncErrors(async (req, res, next) => {
  const features = new APIFeatures(Tours.find(filter), req.query)
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
}); */
/* 
exports.getTour = catchAsyncErrors(async (req, res, next) => {
  const tour = await Tours.findById(req.params.id).populate('reviews');
  if (!tour) {
    return next(new AppErrors(404, `tour with id ${req.params.id} not found`));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
}); */

// exports.createTour = catchAsyncErrors(async (req, res, next) => {
//   const result = await Tours.create(req.body);
//   res.status(201).json({
//     status: 'success',
//     //appended from middleware
//     requestedAt: req.requestTime,
//     data: { result },
//   });
// });

/* exports.updateTour = catchAsyncErrors(async (req, res, next) => {
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
}); */

/* exports.deleteTour = catchAsyncErrors(async (req, res, next) => {
  const tour = await Tours.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppErrors(404, `tour with id ${req.params.id} not found`));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
}); */
