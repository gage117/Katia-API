const express = require('express');

const matchedRouter = express.Router();
const bodyParser = express.json();

const MatchedService = require('./matched-service');
const UserService = require('../user/user-service');

matchedRouter
  .route('/:userId')
  .get(checkUserExists, async (req, res, next) => {
    // when you get the matched endpoint it will check your matches table
    // for everyone you have matched, it will check THEIR matches table to see if you are included in them
    //  for every person who is MATCHED we will return them
    try{
      const possibleMatches = await MatchedService.getUserMatches(
        req.app.get('db'),
        req.params.userId
      );
      console.log(possibleMatches);
      console.log( possibleMatches[0].match_user_id);
      console.log( possibleMatches[1].match_user_id);
      console.log( possibleMatches[2].match_user_id);
      // checks each match our user has made and will see if a match exists
      const test = await MatchedService.matchExists(
          req.app.get('db'),
          possibleMatches[1].match_user_id,
          req.params.userId  
      );

      console.log(test);
      const results2 = possibleMatches.filter(async (possibleMatch) => {
        const result = await MatchedService.matchExists(
            req.app.get('db'),
            possibleMatch.match_user_id,
            req.params.userId  
        );

        console.log(`result: ${result} ${typeof result}`);
        return result;
      });

      console.log(`results2:`, results2);
      res.json({possibleMatches});

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