const Tours = require('../models/tourModel');

exports.getAllTours = async (req, res) => {
  try {
    const tours = await Tours.find();
    res.status(200).json({
      status: 'success',
      data: {
        tours,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: 'No tour package found',
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tours.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: `No tour package found with id: ${req.params.id}`,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const result = await Tours.create(req.body);
    res.status(201).json({
      status: 'success',
      //appended from middleware
      requestedAt: req.requestTime,
      data: { result },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid Data',
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const updatedTour = await Tours.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour: updatedTour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tours.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};
