const express = require('express');
const authController = require('../controller/authController');
const bookingController = require('../controller/bookingController');

const router = express.Router();

router.get(
  '/checkout-session/:tourId',
  authController.protect,
  bookingController.getCheckoutSession
);
module.exports = router;
