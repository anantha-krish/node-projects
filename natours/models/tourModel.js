const mongoose = require('mongoose');

const toursSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have name'],
    unique: true,
    trim: true,
  },

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
  },
  ratingsAverage: {
    type: Number,
    default: 4.8,
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
  priceDiscount: Number,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Tours = mongoose.model('Tours', toursSchema);

module.exports = Tours;
