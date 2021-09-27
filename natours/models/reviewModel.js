const mongoose = require('mongoose');
const Tours = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: { type: String, required: [true, 'Please enter review'] },
    rating: { type: Number, min: 1, max: 5 },
    createdAt: { type: Date, default: Date.now() },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tours',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    /** show virtual properties while conversion */
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: 'tour',
        numOfRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  await Tours.findByIdAndUpdate(tourId, {
    ratingsAverage: stats[0].avgRating,
    ratingsQuantity: stats[0].numOfRating,
  });
};
/** Prevent Duplicate reviews */
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, async function (next) {
  /*   this.populate([
    { path: 'tour', select: 'name' },
    { path: 'user', select: 'name photo' },
  ]); */
  //removed tourr population to avoid chain of populates while retriving a tour
  this.populate({ path: 'user', select: 'name photo' });
  next();
});
reviewSchema.post('save', function () {
  //access static method before instance creation
  this.constructor.calcAverageRatings(this.tour);
});

// update ratings on delete and updates
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.tempQuery = await this.findOne();
  next();
});
reviewSchema.post(/^findOneAnd/, async function () {
  //here we can't access document middleware, hence we to do work around usin query middleware
  await this.tempQuery.constructor.calcAverageRatings(this.tempQuery.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
