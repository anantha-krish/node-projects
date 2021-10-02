const express = require('express');
const viewController = require('../controller/viewController');
const authController = require('../controller/authController');

const router = express.Router();
//router.use(authController.isUserLoggedIn);
router.get('/', authController.isUserLoggedIn, viewController.getOverview);
router.get(
  '/tour/:slug',
  authController.isUserLoggedIn,
  viewController.getTour
);
router.get('/login', authController.isUserLoggedIn, viewController.login);
router.get('/account', authController.protect, viewController.getAccount);
router.post(
  '/update-user-details',
  authController.protect,
  viewController.updateUserDetails
);
module.exports = router;
