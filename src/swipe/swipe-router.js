const express = require('express');
const swipeRouter = express.Router();
const bodyParser = express.json();
const SwipeService = require('./swipe-service');
const UserService = require('../user/user-service');

swipeRouter
  .route('/:userId')
  .get(async (req, res, next) => {
    let rejections = await SwipeService.getRejectionsTableInfo(
      req.app.get('db'),
      req.params.userId
    );
    let matches = await SwipeService.getMatchesTableInfo(
      req.app.get('db'),
      req.params.userId
    );
    let allSwiped = [...matches, ...rejections].map(item => item.id);

    let allUsers = await SwipeService.getAllUsers(
      req.app.get('db'),
      req.params.userId
    );    
    let allUsersFiltered = allUsers.filter(item => !allSwiped.includes(item.id));

    const queue = allUsersFiltered.map(async (user) => {
      const genres = await UserService.getUserGenres(req.app.get('db'), user.id).then(genres => genres.map(genre => genre.genre));
      const platforms = await UserService.getUserPlatforms(req.app.get('db'), user.id).then(platforms => platforms.map(platform => platform.platform));

      return {
        ...user,
        genres,
        platforms
      };
    });

    Promise.all(queue).then((queue) => res.json({ queue }))
      .catch(next);
  })

  .post(bodyParser, (req, res, next) => {
    const { id } = req.body;

    SwipeService.matchExists(
      req.app.get('db'),
      req.params.userId,
      id
    )
      .then(exists => {
        if(exists) {
          return res.status(400).json({
            error: 'Match already exists'
          });
        }

        SwipeService.addUserMatch(
          req.app.get('db'),
          req.params.userId,
          id
        )
          .then(() => {
            res.status(201).json('match created');
          });
      })
      .catch(next);
  });

swipeRouter
  .route('/reject/:userId')
  .post(bodyParser, (req, res, next) => {
    const { id } = req.body;

    SwipeService.rejectExists(
      req.app.get('db'),
      req.params.userId,
      id
    )
      .then(exists => {
        if(exists) {
          return res.status(400).json({
            error: 'Match already exists'
          });
        }

        SwipeService.addRejection(
          req.app.get('db'),
          req.params.userId,
          id
        )
          .then(() => {
            res.status(201).json('user rejected');
          });
      })
      .catch(next);
  });

module.exports = swipeRouter;