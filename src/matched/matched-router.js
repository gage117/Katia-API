//! DONE TODO: 1) Add validation. If somehow the user ended up matched in their own data (should NEVER happen, but might be in the seed file)
// TODO: 2) Remove thinking.js
// TODO: 3) Update README.md for the /matched endpoint
// TODO: 4) Implement serializeMatched in MatchedService
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
  .get(validateUserId, checkUserExists, async (req, res, next) => {
    // When you get the matched endpoint it will check your matches table
    // for everyone you have matched, it will check THEIR matches table to see if you are included in them
    // for every person who is MATCHED we will return them
    try{
      const possibleMatches = await MatchedService.getUserMatches(
        req.app.get('db'),
        req.params.userId
      );
      // Checks each match our user has made and will see if a match exists
      // since filter doesnt support async functions, we do a for loop implementation
      let matched = [];
      for(let i=0; i < possibleMatches.length; i++) {
        const result = await MatchedService.matchExists(
            req.app.get('db'),
            possibleMatches[i].match_user_id,
            req.params.userId  
        );
        // If the user is somehow matched with themself, remove that entry from the database
        if(possibleMatches[i].match_user_id === req.params.userId) {
            await MatchedService.removeSelfMatch(
                req.app.get('db'),
                req.params.userId
            );
        }
        if(result && possibleMatches[i].match_user_id !== req.params.userId){
          // get the profile information of the matched user
          const profile = await MatchedService.getUserInfo(req.app.get('db'), possibleMatches[i].match_user_id);
          const genres = await UserService.getUserGenres(req.app.get('db'), possibleMatches[i].match_user_id).then(genres => genres.map(genre => genre.genre));
          const platforms = await UserService.getUserPlatforms(req.app.get('db'), possibleMatches[i].match_user_id).then(platforms => platforms.map(platform => platform.platform));

          matched.push({
            ...UserService.serializeProfile(profile),
            lfm_in: profile.lfm_in,
            genres,
            platforms
          });
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

      // After req.params.userId has been validated and converted from a string to number, we pass that on
      req.params.userId = userId;
      next();
    } catch (error) {
      next(error);
    }
  }


  async function checkUserExists(req, res, next) {
    
    try {
      const user = await UserService.getById(
        req.app.get('db'),
        req.params.userId
      );

      if(!user) {
        return res.status(404).json({
          error: 'User doesn\'t exist'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  }

module.exports = matchedRouter;