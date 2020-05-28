var createError = require('http-errors');
var express = require('express');
var slugify = require('slugify');
var path = require('path');
var hpp = require('hpp');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
var xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
var cookieParser = require('cookie-parser');
var compression = require('compression');

var tourRouter = require('./routes/tourRoutes');
var userRouter = require('./routes/userRoutes');
var reviewRouter = require('./routes/reviewRoute');
var bookingRouter = require('./routes/bookingRoute');
var viewRouter = require('./routes/viewRoutes');
var app = express();
app.enable('trust proxy');
// if (process.env.NODE_ENV === 'production') {
//   console.log('Running in production');
// } else if (process.env.NODE_ENV === 'development') {
//   console.log('Running in development');
//   app.use(logger('dev'));
// }

app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({limit: '10kb'}));
//Data sanitization
app.use(express.urlencoded({extended: true, limit: '10kb'}));
app.use(cookieParser());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers.authorization);
  next();
});
app.use(mongoSanitize());
app.use(xss());

const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hr
  max: 100,
  message: 'Too many request from this IP. Please try try again in an hour',
});
app.use('/api/', apiLimiter);
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingQuantity',
      'maxGroupSize',
      'ratingsAverage',
      'difficulty',
      'price',
    ],
  })
);
app.use(compression());
// app.get('/', (req, res) => {
//   res.status(200).render('base', {tour: 'The Forest Hiker', user: 'Samuel'});
// });
// app.get('/overview', (req, res) => {
//   res.status(200).render('overview', {title: 'All Tours'});
// });
// app.get('/tour', (req, res) => {
//   res.status(200).render('tour', {title: 'The Forest Hiker'});
// });

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/booking', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   next(createError(404));
// });

// error handler
app.use(globalErrorHandler);

// console.log(process.env);
module.exports = app;
// export default app;
