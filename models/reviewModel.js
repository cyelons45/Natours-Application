// const crypto = require('crypto');
var mongoose = require('mongoose');
const Tour = require('./tourModel');
// const User = require('./userModel');
// var validator = require('validator');
// var slugify = require('slugify');
// var bcrypt = require('bcryptjs');
// CREATE MONGOOSE SCHEMA AND MODEL
var reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty!'],
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tours',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: {virtuals: true},
    toObject: {virtuals: true},
  }
);

//QUERY MIDDLEWARE
// reviewSchema.pre(/^find/, function (next) {
//     this.find({secretTour: {$ne: true}});
//     next();
//   });
reviewSchema.index({tour: 1, user: 1}, {unique: true});
reviewSchema.pre(/^find/, function (next) {
  //   this.populate({
  //     path: 'tour',
  //     select: 'name',
  //   }).populate({
  //     path: 'user',
  //     select: 'name photo',
  //   });
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

reviewSchema.statics.calculateAverage = async function (tourId) {
  const stats = await this.aggregate([
    {$match: {tour: tourId}},
    {$group: {_id: '$tour', nRating: {$sum: 1}, avgRating: {$avg: '$rating'}}},
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calculateAverage(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});
reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calculateAverage(this.r.tour);
});
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
