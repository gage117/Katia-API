const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');

const config = require('../config');

const UserService = require('./user-service');

const userRouter = express.Router();
const bodyParser = express.json();

userRouter
  .route('/')
  .post(bodyParser, (req, res, next) => {
    const {
      email,
      username,
      password
    } = req.body;

    for(const field of ['email', 'username', 'password'])
      if(!req.body[field])
        return res.status(400).json({
          error: `Missing ${field} in request body`
        });

    const passwordError = UserService.validatePassword(password);

    if(passwordError)
      return res.status(400).json({
        error: passwordError
      });
    
    UserService.hasUserWithUsername(
      req.app.get('db'),
      username
    )
      .then(exists => {
        if(exists)
          return res.status(400).json({
            error: 'Username already taken'
          });

        return UserService.hashPassword(password)
          .then(hashedPassword => {
            const newUser = {
              email,
              username,
              password: hashedPassword
            };

            return UserService.insertUser(
              req.app.get('db'),
              newUser
            )
              .then(user => {
                const newInfo = {
                  display_name: username,
                  bio: null,
                  lfm_in: null,
                  avatar: null,
                  user_id: user.id
                };

                UserService.insertInfo(
                  req.app.get('db'),
                  newInfo
                )
                  .then(info => {
                    const completeUser = {
                      ...user,
                      ...info
                    };
                    delete completeUser.user_id;
                    delete completeUser.password;
                    res
                      .status(201)
                      .location(path.posix.join(req.originalUrl, `/${user.id}`))
                      .json(UserService.serializeFullUser(completeUser));
                  });
              });
          });
      })
      .catch(next);
  })
  .get((req, res, next) => {
    UserService.getAllProfiles(req.app.get('db'))
      .then(profiles => {
        res.json(UserService.serializeProfiles(profiles));
      })
      .catch(next);
  });

userRouter
  .route('/:userId')
  .patch(checkUserExists, bodyParser, (req, res, next) => {
    const {
      display_name,
      bio,
      genres,
      platforms,
      lfm_in,
      avatar
    } = req.body;

    const profileToUpdate = {
      display_name,
      bio,
      lfm_in,
      avatar
    };

    const numberOfValues = Object.values(profileToUpdate).filter(Boolean).length;
    if(numberOfValues === 0 && genres.length === 0 && platforms.length === 0) {
      return res.status(400).json({
        error: 'Request body must contain profile info to update'
      });
    }

    UserService.updateUserInfo(
      req.app.get('db'),
      req.params.userId,
      profileToUpdate
    )
      .then(() => {
        if(genres.length !== 0) {
          UserService.updateGenresForUser(
            req.app.get('db'),
            req.params.userId,
            genres
          );
        }
        if(platforms.length !== 0) {
          UserService.updatePlatformsForUser(
            req.app.get('db'),
            req.params.userId,
            platforms
          );
        }
        res.status(204).end();
      })
      .catch(next);
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

module.exports = userRouter;