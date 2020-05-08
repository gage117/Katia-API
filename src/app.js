require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const errorHandler = require('./middleware/error-handling');

const authRouter = require('./auth/auth-router');
const userRouter = require('./user/user-router');
const swipeRouter = require('./swipe/swipe-router');
const matchedRouter = require('./matched/matched-router');

// Create express app
const app = express();

// Setup morgan option based on environment
const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';


  // app.use((req, res, next) => {
  //   res.header('Access-Control-Allow-Origin', '*');
  //   next();
  // });
// cors middleware for allowing cross origin
app.use(cors());
// morgan middleware for logging information
app.use(morgan(morganOption));
// helmet middleware for hiding our server type
app.use(helmet());

// Route used for handling User Login
app.use('/api/auth', authRouter);
// Route used for handling user logix
app.use('/api/user', userRouter);
// Route used for handling swipe logic
app.use('/api/swipe', swipeRouter);
// Route used for handling matches logix
app.use('/api/matched', matchedRouter);

// Error handling middleware
app.use(errorHandler);

module.exports = app;