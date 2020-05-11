// TODO:  Update README.md for the /matched endpoint
const express = require('express');

const matchedRouter = express.Router();

const MatchedService = require('./matched-service');
const UserService = require('../user/user-service');

const validateUserId = require('../middleware/validate-user-id');
const checkUserExists = require('../middleware/check-user-exists');

//! This is a NAIVE implementation. It will work for our MVP, but the complexity is too high for a scalable product

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
            platforms,
          });
        }
      }
      if (matched.length === 0) {
        res.json(['none']);
      } else {
        res.json(matched);
      }

    } catch (error) {
      next(error);
    }
  })
  .delete(validateUserId, checkUserExists, (req, res, next) => {
    const { match_user_id } = req.body;


    if(!match_user_id) {
      res.status(400).json({ error: '`match_user_id` is missing from request body' });
    }

    MatchedService.removeMatch(req.params.userId, match_user_id)
      .then(() => {
        return res.status(204).end();
      })
      .catch(next);
  });

module.exports = matchedRouter;