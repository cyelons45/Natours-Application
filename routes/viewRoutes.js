var express = require('express');
var router = express.Router();
const authController = require('../controllers/authController');
const viewsController = require('../controllers/viewsController');
const bookingController = require('../controllers/bookingController');
// router.use(authController.isLoggedIn);
router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewsController.getOverview
);
router.get('/contact-us', viewsController.contactUs);
router.get('/download-apps', viewsController.downloadApps);
router.get('/careers', viewsController.careers);
router.get('/become-a-guide', viewsController.becomeOne);
router.get('/about-us', viewsController.aboutUs);
router.get('/signup', authController.isLoggedIn, viewsController.signupForm);
router.get('/login', authController.isLoggedIn, viewsController.loginForm);
router.get('/me', authController.protect, viewsController.me);
router.get(
  '/tour/:tour',
  authController.protect,
  bookingController.setTourUserIds,
  //   authController.getTourID,
  viewsController.getTour
);
router.get(
  '/my-tours',
  authController.protect,
  bookingController.setTourUserIds,
  //   authController.checkBookings,
  viewsController.getMyTours
);
router.get(
  '/my-reviews',
  authController.protect,
  bookingController.setTourUserIds,
  //   authController.getTourID,
  viewsController.getMyReviews
);
router.get(
  '/my-billings',
  authController.protect,
  viewsController.getMyBillings
);

// router.post(
//   '/submit-user-data',
//   authController.protect,
//   viewsController.updateUserData
// );

module.exports = router;
