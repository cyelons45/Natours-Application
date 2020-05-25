// const crypto = require('crypto');
var mongoose = require('mongoose');
const Tour = require('./tourModel');
// const User = require('./userModel');
// var validator = require('validator');
// var slugify = require('slugify');
// var bcrypt = require('bcryptjs');
// CREATE MONGOOSE SCHEMA AND MODEL
var bookingSchema = new mongoose.Schema(
  {
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tours',
      required: [true, 'Booking must belong to a tour'],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Booking must belong to a user'],
    },
    price: {
      type: Number,
      required: [true, 'Booking must have a price'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    paid: {
      type: Boolean,
      default: true,
    },
  }
  //   {
  //     toJSON: {virtuals: true},
  //     toObject: {virtuals: true},
  //   }
);

//QUERY MIDDLEWARE

// reviewSchema.index({tour: 1, user: 1}, {unique: true});

// reviewSchema.statics.calculateAverage = async function (tourId) {
//   const stats = await this.aggregate([
//     {$match: {tour: tourId}},
//     {$group: {_id: '$tour', nRating: {$sum: 1}, avgRating: {$avg: '$rating'}}},
//   ]);
//   if (stats.length > 0) {
//     await Tour.findByIdAndUpdate(tourId, {
//       ratingQuantity: stats[0].nRating,
//       ratingsAverage: stats[0].avgRating,
//     });
//   } else {
//     await Tour.findByIdAndUpdate(tourId, {
//       ratingQuantity: 0,
//       ratingsAverage: 4.5,
//     });
//   }
// };

// reviewSchema.post('save', function () {
//   this.constructor.calculateAverage(this.tour);
// });

// reviewSchema.pre(/^findOneAnd/, async function (next) {
//   this.r = await this.findOne();
//   next();
// });
// reviewSchema.post(/^findOneAnd/, async function () {
//   await this.r.constructor.calculateAverage(this.r.tour);
// });
// bookingSchema.pre(/^find/, function (next) {
//     this.find({secretTour: {$ne: true}});
//     next();
//   });
bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({
    path: 'tour',
    select: 'name',
  });
  next();
});
const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
