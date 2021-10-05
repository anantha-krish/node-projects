const express = require('express');
const tourController = require('../controller/tourController');
const authController = require('../controller/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();
// router.param('id', tourController.checkID);

// defining paths
/** redirect to review router in case of nested route */
router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-5-cheap')
  .get(tourController.top5cheapTours, tourController.getAllTours);

router.route('/stats').get(tourController.getTourStats);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.toursWithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.toursNearby);

router
  .route('/plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getTourPlan
  );
router
  .route('/')
  .get(tourController.getAllTours)
  //chaining middle ware
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
