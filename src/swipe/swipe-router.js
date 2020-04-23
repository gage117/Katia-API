const express = require('express');

const swipeRouter = express.Router();

const SwipeService = require('./swipe-service');
const UserService = require('../user/user-service');

swipeRouter
  .route('/:userId')
  .get(async (req, res, next) => {
    SwipeService.getQueueForUser(
      req.app.get('db'),
      req.params.userId
    )
      .then(async (users) => {
        const matches = await SwipeService.getUserMatches(
          req.app.get('db'),
          req.params.userId
        )
          .then(matches => matches.map(match => match.match_user_id));

        const filter = users.filter(user => {
          return !matches.includes(user.id);
        });
        
        const queue = filter.map(async (user) => {
          const genres = await UserService.getUserGenres(req.app.get('db'), user.id).then(genres => genres.map(genre => genre.genre));
          const platforms = await UserService.getUserPlatforms(req.app.get('db'), user.id).then(platforms => platforms.map(platform => platform.platform));

          return {
            ...user,
            genres,
            platforms
          };
        });

        Promise.all(queue).then((queue) => res.json({ queue }));
      })
      .catch(next);
  });

module.exports = swipeRouter;