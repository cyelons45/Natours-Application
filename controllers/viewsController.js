const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
exports.getOverview = catchAsync(async (req, res, next) => {
  // 1. Get tour data from collection
  const tours = await Tour.find();
  // 2. Build template
  // 3. Render the data using tour data from 1
  res.status(200).render('overview', {title: 'All Tours', tours});
});

exports.getTour = catchAsync(async (req, res, next) => {
  // console.log(req.user);

  // const bookings = await Booking.find({
  //   tour: req.body.tour[0]._id,
  //   user: req.user.id,
  // });

  // let newID;
  // if (bookings.length > 0) {
  //   newID = bookings[0].tour.id;
  // } else {
  //   newID = '1234';
  // }

  const tour = await Tour.findOne({slug: req.params.tour}).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  let booked;
  if (req.user.bookedTours.includes(tour._id)) {
    booked = true;
  } else {
    booked = false;
  }
  // if(req.user.incluse)

  // if (tour._id == newID) {
  //   booked = true;
  // } else {
  //   booked = false;
  // }
  if (!tour) return next(new AppError('There is no tour with that name.', 404));
  res.status(200).render('tour', {title: `${tour.name} Tour`, tour, booked});
});

exports.loginForm = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {title: 'Log into your account'});
});
exports.signupForm = catchAsync(async (req, res, next) => {
  res.status(200).render('signup', {title: 'Your account'});
});
exports.alerts = catchAsync(async (req, res, next) => {
  const {alert} = req.query;
  if (alert === 'booking')
    res.locals.alert = `Your booking was successfull! Please check your email for a confirmation.
  if your booking doesn't show up here immediately,please come back later`;
  next();
});

exports.me = (req, res) => {
  // const user = res.locals.user;
  res.status(200).render('account', {title: `Your account`});
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // const tours = await Tour.find({_id: {$in: tourIDs}});
  // const tourIDs = bookings.map((el) => el.tour);
  let userTours = req.user.bookedTours;
  const tours = await Tour.find({_id: {$in: userTours}});
  res.status(200).render('overview', {title: 'My booked tours', tours});
});

exports.getMyReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find().populate({
    path: 'tour',
    fields: 'name',
  });
  res.status(200).render('myReviews', {title: 'My Reviews', reviews});
});

exports.getMyBillings = catchAsync(async (req, res, next) => {
  res.status(200).render('myBillings', {title: 'My Billings'});
});

exports.aboutUs = catchAsync(async (req, res, next) => {
  res.status(200).render('about', {title: 'About us'});
});
exports.becomeOne = catchAsync(async (req, res, next) => {
  res.status(200).render('becomeAguide', {title: 'Become a guide'});
});
exports.downloadApps = catchAsync(async (req, res, next) => {
  res.status(200).render('downloadApps', {title: 'Download Apps'});
});
exports.careers = catchAsync(async (req, res, next) => {
  res.status(200).render('careers', {title: 'Careers'});
});
exports.contactUs = catchAsync(async (req, res, next) => {
  res.status(200).render('contacts', {title: 'Contact us'});
});

// exports.updateUserData = catchAsync(async (req, res, next) => {
//   console.log(req.user);
//   const updatedUser = await User.findByIdAndUpdate(
//     req.user._id,
//     {
//       name: req.body.name,
//       email: req.body.email,
//     },
//     {new: true, runValidators: true}
//   );

//   res.status(200).render('account', {title: `Your account`, user: updatedUser});
// });
