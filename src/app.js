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

const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(cors());
app.use(morgan(morganOption));
app.use(helmet());

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/swipe', swipeRouter);
app.use('/api/matched', matchedRouter);

app.use(errorHandler);

module.exports = app;