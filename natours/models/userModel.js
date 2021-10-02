const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    //coverts contents to lower case
    lowercase: true,
    //custom validators
    validate: [validator.isEmail, 'Please enter a valid email'],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    //by default don't display in select query
    select: false,
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'guide', 'lead-guide'],
    default: 'user',
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords don't match",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});
userSchema.pre('save', async function (next) {
  //only execute hashing if there is a modification
  if (!this.isModified('password')) return next();
  // hash with cost of 12 (lareger value will cause delay)
  this.password = await bcrypt.hash(this.password, 12);
  // don't persist confirm password
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  // 1 sec hack, to prevent sharing JWT token before updating timestamp
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
userSchema.pre(/^find/, async function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.validatePassword = async function (
  candidatePassword,
  dbHashedPassword
) {
  //can't access this.password as select is false
  return await bcrypt.compare(candidatePassword, dbHashedPassword);
};

userSchema.methods.isPasswordChangedAfterTokenIssue = function (jwtTimestamp) {
  //can't access this.password as select is false
  if (this.passwordChangedAt) {
    const passwordModifiedTime = this.passwordChangedAt.getTime() / 1000;
    return jwtTimestamp < passwordModifiedTime;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  // add 10 mins access
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
