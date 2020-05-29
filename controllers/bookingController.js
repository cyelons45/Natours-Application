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
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    // success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${
    //   req.params.tourId
    // }&user=${req.user.id}&price=${tour.price}`,
    success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourID,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [
          `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`,
        ],
        amount: tour.price * 100,
        currency: 'usd',
        quantity: 1,
      },
    ],
  });

  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});
// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//   // only temporary bcos it's unsecure
//   const {tour, user, price} = req.query;
//   if (!tour && !user && !price) return next();
//   let users = await User.findById(user);
//   await users.getBookedTours(tour);
//   await Booking.create({tour, user, price});
//   await users.save({validateBeforeSave: false});
//   res.redirect(req.originalUrl.split('?')[0]);
// });

const createBookingCheckout = catchAsync(async (session) => {
  // only temporary bcos it's unsecure
  // const {tour, user, price} = req.query;
  // if (!tour && !user && !price) return next();
  // await users.getBookedTours(tour);
  let user = await User.findOne({email: session.customer_email});
  let userId = user._id;

  const tour = session.client_reference_id;
  console.log(tour, userId);
  let price = session.display_items[0].amount / 100;
  await Booking.create({tour, userId, price});
  await user.getBookedTours(tour);
  await user.save({validateBeforeSave: false});
});

exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }
  if (event.type === 'checkout.session.completed')
    createBookingCheckout(event.data.object);
  res.status(200).json({received: true});
};
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
