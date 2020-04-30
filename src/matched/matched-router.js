const express = require('express');

const matchedRouter = express.Router();

const MatchedService = require('./matched-service');
const UserService = require('../user/user-service');

//! This is a NAIVE implementation. It will work for our MVP, but the complexity is too high for a scalable product
//!     our worst case scenario is exponential time - O(n^2) (e.g. if many users swiped 'yes' on everyone). 
//! Some better implementatio ideas might be:
//! 1) Use Hash Maps to find the matches as the runtime would have a complexity of O(1) for the best-case and the average-case and O(n) for the 
//!     worst-case. The worst-case only really happens if you have a collision though, so if implemented intelligently can be a VERY rare occurence.
//! 2) Refactor(BEFORE launch) AND/OR add additional tables in the Database with at least one relational table?(join entity? reference?) for the
//!     many-to-many relationship (i.e. many users can have many matches). Note: only attempt to refactor the database before launch if at all - 
//! 3) Use Stacks (stacks are great for many types of Matching problems - not sure if this is the right way to go though..)

matchedRouter
  .route('/:userId')
  .get(validateUserId, async (req, res, next) => {
    // When you get the matched endpoint it will check your matches table
    // for everyone you have matched, it will check THEIR matches table to see if you are included in them
    //  for every person who is MATCHED we will return them
    try{
      const possibleMatches = await MatchedService.getUserMatches(
        req.app.get('db'),
        req.user.id
      );
    //   console.log('req.user is: ', req.user);
    //   console.log('typeof req.user.id is: ', typeof req.user.id);
    //   console.log('req.params.userId is: ', req.params.userId);
    //   console.log('typeof req.params.userId is: ', typeof req.params.userId);
    //   console.log(possibleMatches);

      // Checks each match our user has made and will see if a match exists
      // since filter doesnt support async functions, we do a for loop implementation
      // TODO: 1) Add validation. If someone the user ended up matched in their own data (should NEVER happen, but might be in the seed file)
      // TODO: 2) Remove thinking.js
      // TODO: 3) Update README.md for the /matched endpoint
      let matched = [];
      for(let i=0; i < possibleMatches.length; i++) {
        // finds out if there is a match
        const result = await MatchedService.matchExists(
            req.app.get('db'),
            possibleMatches[i].match_user_id,
            req.params.userId  
        );
        // && req.params.userId !== possibleMatches[i].match_user_id
        if(result ){
            matched.push(possibleMatches[i])
        }
      }

      res.json({matched});

    } catch (error) {
        next(error);
    }

  });


  async function validateUserId(req, res, next) {
    try {
      let { userId } = req.params;
      userId = Number(userId);

      // If userId is not a number
      if(!Number(req.params.userId)) {
        return res.status(400).json({ error: 'userId must be an number'});
      }
      // If userId is greater than 2^53 - 1 or not an integer
      if(!Number.isSafeInteger(userId)){
        return res.status(400).json({
          error: 'userId must be a safe integer'
        });
      }
      if(userId < 0) {
        return res.status(400).json({
          error: 'userId must be a positive integer'
        });
      }
      // check if that user exists in the database
      const user = await UserService.getById(
        req.app.get('db'),
        userId
      );
        
      if(!user) {
        return res.status(404).json({
          error: 'User doesn\'t exist' // if you don't use brackets and explicitly return you get errors from the server in console - not ideal
        });
      }
      // if the user does exist, pass it along so you don't have to pull it from the database again
      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  }

module.exports = matchedRouter;