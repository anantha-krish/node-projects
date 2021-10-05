const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const factory = require('./handlerFactory');
const catchAsyncErrors = require('../utils/catchAsyncErrors');
const AppErrors = require('../utils/appErrors');

const filterObj = (obj, ...alllowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (alllowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });

  return newObj;
};

/* const multerStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'public/img/users');
  },
  filename: (req, file, callback) => {
    const ext = file.mimetype.split('/')[1];
    // using userId + timestamp is best combination to give unique name for file
    callback(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  },
}); */
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, callback) => {
  if (file.mimetype.startsWith('image')) {
    return callback(null, true);
  }
  return callback(new AppErrors(400, 'Please upload an image file'), false);
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadPhotoHandler = upload.single('photo');

exports.resizePhotoHandler = async (req, res, next) => {
  if (!req.file) return next();
  /** assign filename in req */
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  // take buffered file
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
};

exports.updateMe = catchAsyncErrors(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppErrors(
        400,
        "You can't update password here, please use /user/updateMyPassword."
      )
    );
  }
  //below logic allows to filter out neccessary items to be updated
  // thus they can't directly change password and role
  const filteredBody = filterObj(req.body, 'name', 'email');
  /** save filename in db */
  filteredBody.photo = req.file.filename;
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

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

/* exports.getAllUsers = catchAsyncErrors(async (req, res) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    result: users.length,
    data: {
      users,
    },
  });
}); */
