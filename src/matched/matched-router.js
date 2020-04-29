const express = require('express');

const matchedRouter = express.Router();
const bodyParser = express.json();

const MatchedService = require('./matched-service');
const UserService = require('../user/user-service');
const SwipeService = require('../swipe/swipe-service');

matchedRouter
  .route('/:userId')
  .get(checkUserExists, async (req, res, next) => {
    // when you get the matched endpoint it will check your matches table
    // for everyone you have matched, it will check THEIR matches table to see if you are included in them
    //  for every person who is MATCHED we will return them
    try{
      const possibleMatches = await SwipeService.getUserMatches(
        req.app.get('db'),
        req.params.userId
      );

      res.json({test: 'test'});

    } catch (error) {
        next(error);
    }

  });

  async function checkUserExists(req, res, next) {
    try {
      const user = await UserService.getById(
        req.app.get('db'),
        req.params.userId
      );
  
      if(!user)
        res.status(404).json({
          error: 'User doesn\'t exist'
        });
  
      res.user = user;
      next();
    } catch (error) {
      next(error);
    }
  }

module.exports = matchedRouter;