const crypto = require('crypto');
const {promisify} = require('util');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/userModel');
const Tour = require('./../models/tourModel');
const Review = require('./../models/reviewModel');
const Booking = require('./../models/bookingModel');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');
var jwt = require('jsonwebtoken');

const signToken = (id) => {
  return jwt.sign({id}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    secure: false,
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  res.status(statusCode).json({status: 'success', token, data: {user}});
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    role: req.body.role,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();
  createSendToken(newUser, 200, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const {email, password} = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  const user = await User.findOne({email}).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access', 401)
    );
  }
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError('The user belonging to this token does no longer exist', 401)
    );
  }
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password. Please login again', 401)
    );
  }
  req.user = freshUser;
  res.locals.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //Get user based on posted email
  const user = await User.findOne({email: req.body.email});
  if (!user) {
    return next(new AppError('There is no user with that email address', 404));
  }
  //Generate random token
  const resetToken = user.createPasswordResetToken();
  await user.save({validateBeforeSave: false});

  // const message = `Forgot your password? Submit a PATCH request with your new password and
  // passwordConfirm to:${resetURL}.\nIf you didn't forget your password.please ignore this email!`;
  // const subject = 'Your password reset Token (valid for 10 min)';
  try {
    //send back as email
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    // await sendEmail({
    //   email: user.email,
    //   subject,
    //   message,
    // });
    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({validateBeforeSave: false});
    return next(
      new AppError('There was an error sending the email, Try again later', 500)
    );
  }
});

exports.resetPassword = async (req, res, next) => {
  //1. Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: {$gt: Date.now()},
  });

  //2.If token has not expired and there is a user. Set thenew password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  createSendToken(user, 200, res);
};

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });
  res.status(200).json({status: 'success'});
};

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1. Get user from collection
  const user = await User.findById(req.user._id).select('+password');
  //2. Check if posted current password is correct
  if (!(await user.correctPassword(req.body.password, user.password))) {
    return next(new AppError('Your current password is incorrect', 401));
  }
  // //3.If so, update password
  user.password = req.body.newpassword;
  user.passwordConfirm = req.body.newpasswordConfirm;
  await user.save();
  //4.Log user in ,Semd JWT
  res.status(200).json({
    status: 'success',
    data: {message: 'Password Changed successfully'},
  });
});

// only for rendered pages
exports.isLoggedIn = async (req, res, next) => {
  let token;
  if (req.cookies.jwt) {
    try {
      token = req.cookies.jwt;
      const decoded = await jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);
      const freshUser = await User.findById(decoded.id);
      if (!freshUser) {
        return next();
      }
      if (freshUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      res.locals.user = freshUser;
      return next();
    } catch (err) {
      return next();
    }
  }

  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.checkReviewCount = catchAsync(async (req, res, next) => {
  const reviews = await Review.find({
    user: req.body.user,
    tour: req.body.tour,
  });

  if (reviews.length > 0) {
    return next(
      new AppError('You have already submitted a review for this tour', 404)
    );
  }
  next();
});

exports.getTourID = catchAsync(async (req, res, next) => {
  const tour = await Tour.find({slug: req.body.slug});
  req.body.tour = tour;
  next();
});

// exports.checkBookings = catchAsync(async (req, res, next) => {
//   const bookings = await Booking.find({
//     user: req.body.user,
//     tour: req.body.tour,
//   });
//   // console.log(bookings);
//   if (bookings.length > 0) {
//     return next(new AppError('You have already booked this tour', 404));
//   }
//   // req.user.paid = bookings[0].paid;
//   next();
// });
