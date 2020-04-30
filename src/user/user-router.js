const express = require('express');
const path = require('path');
const upload = require('./avatar-service');

const UserService = require('./user-service');
const SwipeService = require('../swipe/swipe-service');

const userRouter = express.Router();
const bodyParser = express.json();


userRouter
  .route('/')
  .post(bodyParser, (req, res, next) => {
    const {
      email,
      display_name,
      password
    } = req.body;

    for(const field of ['email', 'display_name', 'password'])
      if(!req.body[field])
        return res.status(400).json({
          error: `Missing ${field} in request body`
        });

    const passwordError = UserService.validatePassword(password);

    if(passwordError)
      return res.status(400).json({
        error: passwordError
      });
    
    UserService.hasUserWithEmail(
      req.app.get('db'),
      email
    )
      .then(exists => {
        if(exists)
          return res.status(400).json({
            error: 'Email already taken'
          });

        return UserService.hashPassword(password)
          .then(hashedPassword => {
            const newUser = {
              email,
              password: hashedPassword
            };

            return UserService.insertUser(
              req.app.get('db'),
              newUser
            )
              .then(user => {
                const newInfo = {
                  display_name: display_name,
                  bio: null,
                  lfm_in: null,
                  avatar: null,
                  user_id: user.id
                };

                UserService.insertUserInfo(
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
  .patch(checkUserExists, bodyParser, async (req, res, next) => {
    let {
      display_name,
      bio,
      genres,
      platforms,
      lfm_in,
      psn,
      xbox,
      steam,
      discord,
      nintendo
    } = req.body;

    let profileToUpdate = {
      display_name,
      bio,
      lfm_in,
      psn,
      xbox,
      steam,
      discord,
      nintendo
    };

    const numberOfValues = Object.values(profileToUpdate).filter(Boolean).length;
    if(numberOfValues === 0 && genres.length === 0 && platforms.length === 0) {
      return res.status(400).json({
        error: 'Request body must contain profile info to update'
      });
    }

    if(lfm_in !== null && lfm_in.split(',').length > 3) {
      return res.status(400).json({
        error: '"lfm_in" must be a max of 3 games, separated by commas'
      });
    }

    UserService.updateUser(
      req.app.get('db'),
      req.params.userId,
      profileToUpdate
    )
      .then(user => {
        if(genres) {
          console.log(genres);
          UserService.updateGenresForUser(
            req.app.get('db'),
            req.params.userId,
            genres
          );
        }
        if(platforms) {
          UserService.updatePlatformsForUser(
            req.app.get('db'),
            req.params.userId,
            platforms
          );
        }

        // console.log({...user[0], genres: })
        console.log({...user[0]});
        res.status(203).json(user[0]);
      })
      .catch(next);
  })
  .get(checkUserExists, async (req, res) => {
    const profile = await UserService.getUserInfo(req.app.get('db'), req.params.userId);
    const genres = await UserService.getUserGenres(req.app.get('db'), req.params.userId).then(genres => genres.map(genre => genre.genre));
    const platforms = await UserService.getUserPlatforms(req.app.get('db'), req.params.userId).then(platforms => platforms.map(platform => platform.platform));
    res.json({
      ...UserService.serializeProfile(profile),
      lfm_in: profile.lfm_in,
      genres,
      platforms
    });
  });

userRouter
  .route('/:userId/matches')
  .get(checkUserExists, (req, res, next) => {
    SwipeService.getUserMatches(
      req.app.get('db'),
      req.params.userId
    )
      .then(matches => {
        const profiles = matches.map(async (match) => {
          const userInfo = await UserService.getUserInfo(
            req.app.get('db'),
            match.match_user_id
          )
            .then(profile => {
              return profile;
            });
            
          return {...userInfo};
        });
        Promise.all(profiles).then(profiles => res.json(UserService.serializeProfiles(profiles)));
      })
      .catch(next);
  })
  .post(checkUserExists, (req, res, next) => {
    const { matchId } = req.body;

    UserService.insertMatch(
      req.app.get('db'),
      req.params.userId,
      matchId
    )
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });

userRouter
  .route('/genres/all')
  .get((req, res, next) => {
    UserService.getGenres(req.app.get('db'))
      .then(genres => res.status(200).json(genres));
  });

userRouter
  .route('/:userId/avatar')
  .post(checkUserExists, upload.single('profileImg'), (req, res, next) => {
    UserService.saveAvatar(req.app.get('db'), req.params.userId, req.file.location)
      .then(() => {
        res.json({ location: req.file.location });
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
      
    delete user.password;
    res.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = userRouter;