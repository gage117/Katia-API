const express = require('express');
const swipeRouter = express.Router();
const bodyParser = express.json();
const SwipeService = require('./swipe-service');
const UserService = require('../user/user-service');

// Route used for getting user queue and 'swipe right' action
swipeRouter
  .route('/:userId')
  // Endpoint for getting a users "Swipe Queue"
  .get(async (req, res, next) => {
    // Get user rejections from DB
    let rejections = await SwipeService.getRejectionsTableInfo(
      req.app.get('db'),
      req.params.userId
    );

    // Get user matches from DB
    let matches = await SwipeService.getMatchesTableInfo(
      req.app.get('db'),
      req.params.userId
    );

    // Combine rejections and matches into one array of ids
    let allSwiped = [...matches, ...rejections].map(item => item.id);

    // Get all registered users from DB
    let allUsers = await SwipeService.getAllUsers(
      req.app.get('db'),
      req.params.userId
    );    

    // Filter out users who have already been swiped
    let allUsersFiltered = allUsers.filter(item => !allSwiped.includes(item.id));

    // Convert array of userIds to array of User Profile Objects
    const queue = allUsersFiltered.map(async (user) => {
      const genres = await UserService.getUserGenres(req.app.get('db'), user.id).then(genres => genres.map(genre => genre.genre));
      const platforms = await UserService.getUserPlatforms(req.app.get('db'), user.id).then(platforms => platforms.map(platform => platform.platform));

      return {
        ...user,
        genres,
        platforms
      };
    });

    // Use Promise.all to enable using async function inside Array.map
    // Return the array of User Profile Objects
    Promise.all(queue).then((queue) => res.json({ queue }))
      .catch(next);
  })

  // Endpoint for Posting a "Swipe" action
  .post(bodyParser, (req, res, next) => {
    // Get the id of swiped user from requesdt
    const { id } = req.body;

    // Check if a match already exists between users
    SwipeService.matchExists(
      req.app.get('db'),
      req.params.userId,
      id
    )
      .then(exists => {
        // If match exists return 400
        if(exists) {
          return res.status(400).json({
            error: 'Match already exists'
          });
        }

        // Otherwise add the match to the DB
        SwipeService.addUserMatch(
          req.app.get('db'),
          req.params.userId,
          id
        )
          .then(() => {
            // Return 201
            res.status(201).json('match created');
          });
      })
      // Catch any errors and send them to error-handler middleware
      .catch(next);
  });

// Route used for 'swipe left' action
swipeRouter
  .route('/:userId/reject')
  // Post a reject action
  .post(bodyParser, (req, res, next) => {
    // Get swiped users id from request
    const { id } = req.body;

    // Check if the swiped user has already been rejected
    SwipeService.rejectExists(
      req.app.get('db'),
      req.params.userId,
      id
    )
      .then(exists => {
        // If rejection exists return 400
        if(exists) {
          return res.status(400).json({
            error: 'Match already exists'
          });
        }

        // Add rejection to the DB
        SwipeService.addRejection(
          req.app.get('db'),
          req.params.userId,
          id
        )
          .then(() => {
            // Return 201
            res.status(201).json('user rejected');
          });
      })
      // Catch any errors and send them to error-handler middleware
      .catch(next);
  });

module.exports = swipeRouter;