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
      // checks each match our user has made and will see if a match exists
      const matched = possibleMatches.filter(async possibleMatch => {
        const result = await MatchedService.matchExists(
            req.app.get('db'),
            possibleMatch.match_user_id,
            req.params.userId  
        );

        console.log(`result: ${result} ${typeof result}`);
        return result;

        // return await MatchedService.matchExists(
        //     req.app.get('db'),
        //     possibleMatch.match_user_id,
        //     req.params.userId  
        // );
      });

      console.log(`matched:`, matched);
      //return Promise.all(matched).then(matched => res.json(matched));
      res.json({possibleMatches});

    } catch (error) {
        next(error);
    }

  });

//   userRouter
//   .route('/:userId/matches')
//   .get(checkUserExists, (req, res, next) => {
//     SwipeService.getUserMatches(
//       req.app.get('db'),
//       req.params.userId
//     )
//       .then(matches => {
//         const profiles = matches.map(async (match) => {
//           const userInfo = await UserService.getUserInfo(
//             req.app.get('db'),
//             match.match_user_id
//           )
//             .then(profile => {
//               return profile;
//             });
            
//           return {...userInfo};
//         });
//         Promise.all(profiles).then(profiles => res.json(UserService.serializeProfiles(profiles)));
//       })
//       .catch(next);

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