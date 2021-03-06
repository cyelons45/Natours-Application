#!/usr/bin/env node

/**
 * Module dependencies.
 */
// import app from '../app.js';
//uncaught exception
process.on('uncaughtException', (err) => {
  console.log(err.name, +': ' + err.message);
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  process.exit(1);
});
var app = require('./app');
var mongoose = require('mongoose');
var sql = require('mssql');

var logger = require('morgan');
var debug = require('debug')('node-remaster1:server');
var http = require('http');
const dotenv = require('dotenv');
dotenv.config({path: './config.env'});

//===================================================================================================
// CONNECT DATABASE TO SQL SERVER
// config for your database
// var config = {
//   user: process.env.SQL_USER,
//   password: process.env.SQL_PASSWORD,
//   server: process.env.SQLSERVER,
//   database: process.env.SQL_DATABASE,
//   port: 3000,
//   options: {
//     encrypt: true,
//     enableArithAbort: true,
//   },
// };
//===================================================================================================
// let sqlRequest = sql.connect(config).then(() => {
//   console.log('SQL Server DB Connection successful');
//   return new sql.Request();
// });
// function selectFromTable() {
//   sqlRequest.then((pl) => {
//     const tour = 'SELECT * FROM tours WHERE rating>2';
//     pl.query(tour, (err, result) => {
//       if (err) console.log(err);
//       console.table(result.recordset);
//       sql.close();
//     });
//   });
// }
// selectFromTable();
// sqlRequest.then((pl) => {
//   const tour =
//     "INSERT INTO tours (name, price,rating) VALUES ('The Mighty Man', 700,2.1)";
//   pl.query(tour, (err, result) => {
//     if (err) console.log(err);
//     selectFromTable();
//   });
// });

// //   // const tour =
// //   //   'CREATE TABLE tours (name VARCHAR(50) UNIQUE, price DECIMAL NOT NULL,rating DECIMAL DEFAULT(4.5))';

////////////////////////////////////////////////////////////////////////////////////////////////////
//////////CONNECTION TO MONGODB/MONGOOSE/////////////////////////////////////////

//Set up default mongoose connection
var DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('MongoDB Connection successful');
  });
// .catch (err => console.log (err.type));
// var tourSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'A tour must have a name'],
//   },
//   rating: {
//     type: Number,
//     default: 4.5,
//     unique: true,
//   },
//   price: {
//     type: Number,
//     required: [true, 'A tour must have a price'],
//   },
// });
// const Tour = mongoose.model('Tours', tourSchema);
// module.exports = Tour;
// const testTour = new Tour({
//   name: 'The Park Camper',
//   rating: 4.2,
//   price: 400,
// });
// testTour
//   .save()
//   .then((doc) => console.log(doc))
//   .catch((err) => console.log(err));
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
// if (process.env.NODE_ENV == 'production') {
//   console.log(process.env.PORT);
//   port = normalizePort(process.env.PORT);
//   console.log('Running in production');
// } else if (process.env.NODE_ENV == 'development') {
//   port = normalizePort(process.env.PORT);
//   console.log('Running in development');
//   app.use(logger('dev'));
// }
// ////////////////////////////////////////////////////
// // ENVIRONMENT VARIABLES

// if (process.env.NODE_ENV === 'production') {
//   console.log('Running in production');
// } else if (process.env.NODE_ENV === 'development') {
//   console.log('Running in development');
//   app.use(logger('dev'));
// }
// console.log(process.env.PORT);
// ////////////////////////////////////////////////////////

// var port = normalizePort(process.env.PORT || '3000');

/**
 * Create HTTP server.
 */
var server = http.createServer(app);
/**
 * Listen on provided port, on all network interfaces.
 */
const port = process.env.PORT || 4000;
app.set('port', port);
const Server = server.listen(port, () => {
  console.log('Listening to port ' + port);
});

//unhandled rejection
process.on('unhandledRejection', (err) => {
  // console.log(err.stack);
  console.log(err.name, +': ' + err.message);
  console.log('UNHANDLED REJECTION! Shutting down...');
  Server.close(() => {
    process.exit(1);
  });
});

// server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */
process.on('SIGTERM', () => {
  console.log('☠️SIGTERM RECEIVED. Shutting down gracfully.👋');
  server.close(() => {
    console.log('✴ 💥 Process terminated!');
  });
});
function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
