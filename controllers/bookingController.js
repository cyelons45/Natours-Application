// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const stripe = require('stripe')('sk_test_7vBVtjECdrV3S2hML9xHi1Pp00voMv3xQB');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./../controllers/handlerFactory');

exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.slug = req.params.tour;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourID);
  //   console.log(
  //     `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`
  //   );
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourID
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourID,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [
          'https://www.natours.dev/img/tours/tour-5-cover.jpg',
          `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`,
        ],
        amount: tour.price * 100,
        currency: 'usd',
        quantity: 1,
      },
    ],
  });
  //   https://www.natours.dev/img/tours/tour-5-cover.jpg
  // .then((customer) => console.log(customer.id))
  // .catch((error) => console.error(error));
  res.status(200).json({
    status: 'success',
    session,
  });
});
exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // only temporary bcos it's unsecure
  const {tour, user, price} = req.query;
  if (!tour && !user && !price) return next();
  await Booking.create({tour, user, price});
  res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBooking = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);

// exports.createBooking = catchAsync(async (req, res, next) => {
//   const obj = {
//     user: req.body.user,
//     tour: req.params.tourID,
//     price: req.body.price,
//   };
//   const booking = await Booking.create(obj);
//   res.status(200).json({
//     status: 'success',
//     data: {
//       booking,
//     },
//   });
// });
