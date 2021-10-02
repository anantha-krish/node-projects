const catchAsyncErrors = require('../utils/catchAsyncErrors');
const Tours = require('../models/tourModel');
const AppErrors = require('../utils/appErrors');
const User = require('../models/userModel');

exports.getOverview = catchAsyncErrors(async (req, res, next) => {
  const tours = await Tours.find();
  if (!tours) {
    return next(new AppErrors(404, 'No tours available for now'));
  }
  res.status(200).render('overview', {
    title: 'Explore new adventures',
    tours,
  });
});

exports.getTour = catchAsyncErrors(async (req, res, next) => {
  const tour = await Tours.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  if (!tour) {
    return next(new AppErrors(404, "This tour package doesn't exist"));
  }
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      'connect-src http://localhost:3000/api/v1/users/logout https://*.tiles.mapbox.com https://api.mapbox.com https://events.mapbox.com'
    )
    .render('tour', {
      title: `${tour.name}`,
      tour,
    });
});

exports.login = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com"
    )
    .render('login');
});

exports.getAccount = catchAsyncErrors(async (req, res, next) => {
  res.status(200).render('account', { title: 'Your  Account' });
});

exports.updateUserDetails = catchAsyncErrors(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      email: req.body.email,
      name: req.body.name,
    },
    {
      runValidators: true,
      new: true,
    }
  );

  res.status(200).render('account', { user: updatedUser });
});
