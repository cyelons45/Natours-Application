var express = require('express');
var router = express.Router();
const tourController = require('../controllers/tourController');
const authController = require('./../controllers/authController');
var reviewRouter = require('./reviewRoute');
// var bookingRouter = require('./bookingRoute');
// const reviewController = require('./../controllers/reviewController');

// router.param('id', tourController.checkID);

router.use('/:tourId/reviews', reviewRouter);
// router.use('/:tourId/booking', bookingRouter);

// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);
router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.getMonthlyPlan
  );
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.createTour
  );
router
  .route('/:id')
  .get(tourController.getTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  )
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  );

module.exports = router;
