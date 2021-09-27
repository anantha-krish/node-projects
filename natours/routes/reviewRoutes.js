const express = require('express');
const reviewController = require('../controller/reviewController');
const authController = require('../controller/authController');
// mergeParams allows us to get params from previous middlewares (router.use())
const reviewRouter = express.Router({ mergeParams: true });
reviewRouter.use(authController.protect);
reviewRouter
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.assignTourAndUserId,
    reviewController.createReview
  );
reviewRouter
  .route('/:id')
  .patch(
    authController.protect,
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );

module.exports = reviewRouter;
