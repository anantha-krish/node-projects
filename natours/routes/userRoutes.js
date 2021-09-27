const express = require('express');

const router = express.Router();
const userController = require('../controller/userController');
const authController = require('../controller/authController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

/** use protect middleware  for below routes*/
router.use(authController.protect);

router.patch('/updateMe', authController.updateMe);
router.delete('/deleteMe', authController.deleteMe);
router
  .route('/me')
  .get(authController.protect, authController.getMe, userController.getUser);
router.route('/').get(authController.protect, userController.getAllUsers);
router.patch('/updateMyPassword', authController.updatePassword);

/** use retriction to admin  middleware  for below routes*/
router.use(authController.restrictTo('admin'));
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
