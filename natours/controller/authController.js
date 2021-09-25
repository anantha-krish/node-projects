const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const User = require('../models/userModel');
const catchAsyncErrors = require('../utils/catchAsyncErrors');
const AppErrors = require('../utils/appErrors');
const sendMail = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });

const createandSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') {
    //needs https
    cookieOptions.secure = true;
  }
  //creating cookie
  res.cookie('jwt', token, cookieOptions);

  //hide password in response
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

const filterObj = (obj, ...alllowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (alllowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });

  return newObj;
};
exports.signup = catchAsyncErrors(async (req, res, next) => {
  //const newUser = await User.create(req.body); security flaw can send anything
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt || new Date(),
    role: req.body.role,
  });
  //JWT
  createandSendToken(newUser, 201, res);
});

exports.login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppErrors(401, 'Please enter email or password to login'));
  }
  // additionally select password field too.
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.validatePassword(password, user.password))) {
    return next(new AppErrors(401, 'Invalid email or password'));
  }

  createandSendToken(user, 200, res);
});

exports.protect = catchAsyncErrors(async (req, res, next) => {
  if (
    !(
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    )
  ) {
    return next(
      new AppErrors(401, 'You are not logged in! Please login to get access.')
    );
  }

  const token = req.headers.authorization.split(' ')[1];

  if (!token) {
    return next(
      new AppErrors(401, 'You are not logged in! Please login to get access.')
    );
  }
  // promisifying as verify is synchronous
  //throws JSON Web token error and expired error
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // check if user exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppErrors(
        401,
        'You are not logged in! Current User account has been removed.'
      )
    );
  }

  if (currentUser.isPasswordChangedAfterTokenIssue(decoded.iat)) {
    return next(
      new AppErrors(
        401,
        'You are not loggedt in as user has modified the password recently . Please login again'
      )
    );
  }

  //Grant access
  req.user = currentUser;
  next();
});

exports.restrictTo =
  (...roles) =>
  /** returns a middleware function with roles as closure */
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppErrors(403, "You don't have permission to perform the action")
      );
    }
    next();
  };

exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppErrors(404, 'There is no user with provided email address')
    );
  }
  const resetToken = user.createPasswordResetToken();
  //require to ignore validation while saving
  await user.save({ validateBeforeSave: false });
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1//users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a patch request with your new password and passswordCofirm to :${resetURL}\n. Please ignore if already done`;
  try {
    await sendMail({
      email: user.email,
      subject: 'Reset your Password (valid for next 10 mins) ',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token send to mail',
    });
  } catch (err) {
    // in case of mail issues, revert the reset token and expiry
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    next(new AppErrors(500, 'Unable to send email'));
  }
});

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppErrors(400, 'Token is invalid or has expired'));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  createandSendToken(user, 200, res);
});

exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    return next(new AppErrors(400, 'Token is invalid or has expired'));
  }
  if (!(await user.validatePassword(req.body.passwordCurrent, user.password))) {
    return next(new AppErrors(403, 'You have entered wrong current password'));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  createandSendToken(user, 200, res);
});

exports.updateMe = catchAsyncErrors(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppErrors(
        400,
        "You can't update password here, please use /userr/updateMyPassword."
      )
    );
  }
  //below logic allows to filter out neccessary items to be updated
  // thus they can't directly change password and role
  const filteredBody = filterObj(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsyncErrors(async (req, res, next) => {
  //soft delete only making flag as false
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
