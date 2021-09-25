const express = require('express');
const tourController = require('../controller/tourController');
const authController = require('../controller/authController');

const router = express.Router();
// router.param('id', tourController.checkID);

// defining paths
router
  .route('/top-5-cheap')
  .get(tourController.top5cheapTours, tourController.getAllTours);

router.route('/stats').get(tourController.getTourStats);

router.route('/plan/:year').get(tourController.getTourPlan);
router
  .route('/')
  .get(tourController.getAllTours)
  //chaining middle ware
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    // should be accessible only by admin
    authController.restrictTo('admin'),
    tourController.deleteTour
  );

module.exports = router;
