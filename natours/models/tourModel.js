const mongoose = require('mongoose');
const slugify = require('slugify');

const toursSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have name'],
      unique: true,
      trim: true,
      maxlength: [30, ' A tour can have max 30 characters'],
      minlength: [10, ' A tour must have min 10 characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have maxGroupSize'],
    },
    price: {
      type: Number,
      required: [true, 'A tour must have price'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have difficultyLevel'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'A tour can have either:easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.8,
      min: [1, 'Average rating shoulb be atleast 1'],
      max: [5, 'Average rating shoulb be at most 5'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have cover image'],
    },
    images: [String],
    startDates: [Date],
    priceDiscount: {
      type: Number,
      validate: {
        validator: function () {
          return this.priceDiscount < this.price;
        },
        message: 'discount price should be less than real price',
      },
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  //options
  {
    /** show virtual properties while conversion */
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
/** add virtual property (property not in DB) */
toursSchema.virtual('duarationsInWeeks').get(function () {
  //this points to current document
  return this.duration / 7;
});

/** Document middleware
 *  `save` is hook
 * will be called on .save() or .create()
 */
toursSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Query middleware
toursSchema.pre(/^find/, function (next) {
  //this refers to current query
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

toursSchema.post(/^find/, function (docs, next) {
  console.log(`query took ${Date.now() - this.start} ms to execute`);
  next();
});

toursSchema.pre('aggregate', function (next) {
  // pipeline() will return the array of stages
  // unshift will add new stage
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

const Tours = mongoose.model('Tours', toursSchema);

module.exports = Tours;
