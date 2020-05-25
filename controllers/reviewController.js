const Review = require('./../models/reviewModel');
// const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Tour = require('./../models/tourModel');
const factory = require('./../controllers/handlerFactory');

exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

// exports.createReview = catchAsync(async (req, res, next) => {

//   const newReview = await Review.create(req.body);

//   res.status(200).json({status: 'success', data: newReview});
// });
// exports.getAllReviews = catchAsync(async (req, res, next) => {
//   let filter = {};
//   if (req.params.tourId) filter = {tour: req.params.tourId};
//   const reviews = await Review.find(filter);
//   res
//     .status(200)
//     .json({status: 'success', results: reviews.length, data: {data: reviews}});
// });
// exports.getReview = catchAsync(async (req, res, next) => {
//   console.log(req.params);
//   const review = await Review.findById(req.params.id);

//   res.status(200).json({status: 'success', data: {data: review}});
// });
exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
// exports.deleteReview = catchAsync(async (req, res, next) => {
//   console.log(req);
//   res
//     .status(200)
//     .json({status: 'success', data: {data: '<Not yet implemented>'}});
// });

// exports.updateReview = catchAsync(async (req, res, next) => {
//   console.log(req);
//   res
//     .status(200)
//     .json({status: 'success', data: {data: '<Not yet implemented>'}});
// });
