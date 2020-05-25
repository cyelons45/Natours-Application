var express = require('express');
var router = express.Router();
const bookingController = require('../controllers/bookingController');
const authController = require('./../controllers/authController');

router.use(authController.protect);
router.route('/checkout-session/:tourID').get(
  bookingController.setTourUserIds,
  // authController.checkBookings,
  bookingController.getCheckoutSession
);
//
router.use(authController.restrictTo('admin', 'lead-guide'));
router
  .route('/')
  .get(bookingController.getAllBooking)
  .post(bookingController.createBooking);
router
  .route('/:id')
  .get(bookingController.getBooking)
  .delete(bookingController.deleteBooking)
  .patch(bookingController.updateBooking);

module.exports = router;
