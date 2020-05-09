const express = require('express');
const path = require('path');
const upload = require('./avatar-service');

const UserService = require('./user-service');
const checkUserExists = require('../middleware/check-user-exists');

const userRouter = express.Router();
const bodyParser = express.json();

userRouter
  .route('/')
  // Endpoint for registering a user
  .post(bodyParser, (req, res, next) => {
    // Get registration info from request
    const {
      email,
      display_name,
      password
    } = req.body;

    // Cehck that all required fields exist
    for(const field of ['email', 'display_name', 'password'])
      if(!req.body[field])
        return res.status(400).json({
          error: `Missing ${field} in request body`
        });

    // Validate the password to match our secure criteria
    const passwordError = UserService.validatePassword(password);
    if(passwordError)
      return res.status(400).json({
        error: passwordError
      });
    
    // Check if a user with given email already exists
    UserService.hasUserWithEmail(
      req.app.get('db'),
      email
    )
      .then(exists => {
        // If user exists return 400
        if(exists)
          return res.status(400).json({
            error: 'Email already taken'
          });

        // Hash given password to prepare for storage in DB
        return UserService.hashPassword(password)
          .then(hashedPassword => {
            // Create a new user Object for insertion in DB
            const newUser = {
              email,
              password: hashedPassword
            };

            // Insert new User into DB
            return UserService.insertUser(
              req.app.get('db'),
              newUser
            )
              .then(user => {
                // Create default Profile info for user
                const newInfo = {
                  display_name: display_name,
                  bio: null,
                  lfm_in: null,
                  user_id: user.id
                };

                // Insert a profile for newly registered user
                UserService.insertUserInfo(
                  req.app.get('db'),
                  newInfo
                )
                  .then(info => {
                    // Create new object for user account and profile information
                    const completeUser = {
                      ...user,
                      ...info
                    };
                    // Remove user_id as user account already contains id
                    delete completeUser.user_id;
                    // Remove password for security
                    delete completeUser.password;

                    // Return path to newly created user as well as complete user object
                    res
                      .status(201)
                      .location(path.posix.join(req.originalUrl, `/${user.id}`))
                      .json(UserService.serializeFullUser(completeUser));
                  });
              });
          });
      })
      // Catch any errors and send them to error-handler middleware
      .catch(next);
  });

userRouter
  .route('/:userId')
  // Endpoint for updating a users profile information
  .patch(checkUserExists, bodyParser, async (req, res, next) => {
    // Get profile info from request
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
      nintendo,
      other
    } = req.body;

    // Create new profile object for update
    let profileToUpdate = {
      display_name,
      bio,
      lfm_in,
      psn,
      xbox,
      steam,
      discord,
      nintendo,
      other
    };

    // Check that at least one value exists
    const numberOfValues = Object.values(profileToUpdate).filter(Boolean).length;
    if(numberOfValues === 0 && genres.length === 0 && platforms.length === 0) {
      return res.status(400).json({
        error: 'Request body must contain profile info to update'
      });
    }

    // Validate that lfm_in is a max of 3 games, seperated by commas
    if(lfm_in !== null && lfm_in.split(',').length > 3) {
      return res.status(400).json({
        error: '"lfm_in" must be a max of 3 games, separated by commas'
      });
    }

    // Update users profile in DB
    UserService.updateUser(
      req.app.get('db'),
      req.params.userId,
      profileToUpdate
    )
      .then(user => {
        // If genres are passed in, update the users genres
        if(genres) {
          UserService.updateGenresForUser(
            req.app.get('db'),
            req.params.userId,
            genres
          );
        }
        // If platforms are passed in update the users platforms
        if(platforms) {
          UserService.updatePlatformsForUser(
            req.app.get('db'),
            req.params.userId,
            platforms
          );
        }
        // Add updated genres and platforms to returned user row
        user[0].genres = genres;
        user[0].platforms = platforms;
        res.status(203).json(UserService.serializeProfile(user[0]));
      })
      // Catch any errors and send them to error-handler middleware
      .catch(next);
  })
  // Route for getting a user profile
  .get(checkUserExists, async (req, res, next) => {
    // Get userId from request params
    const { userId } = req.params;
    // Get knex instance from app
    const db = req.app.get('db');

    // Get users profile information from DB
    const profile = await UserService.getUserInfo(db, userId).catch(next);
    // Get users genres from DB
    const genres = await UserService.getUserGenres(db, userId).then(genres => genres.map(genre => genre.genre)).catch(next);
    // Get users platforms from DB
    const platforms = await UserService.getUserPlatforms(db, userId).then(platforms => platforms.map(platform => platform.platform)).catch(next);

    // Return serialized profile
    res.json(
      UserService.serializeProfile(profile),
    );
  });

userRouter
  .route('/genres/all')
  // Endpoint for getting all available genres
  .get((req, res, next) => {
    // Get all genre types created in DB
    UserService.getGenres(req.app.get('db'))
      // Return array of all genres
      .then(genres => res.status(200).json(genres))
      // Catch any errors and send them to error-handler middleware
      .catch(next);
  });

userRouter
  .route('/:userId/avatar')
  // Endpoint for updating a users avatar using multer middleware
  .post(checkUserExists, upload.single('profileImg'), (req, res, next) => {
    // Save the returned multer upload location to the DB
    UserService.saveAvatar(req.app.get('db'), req.params.userId, req.file.location)
      .then(() => {
        // Return the location of new avatar
        res.json({ location: req.file.location });
      })
      // Catch any errors and send them to error-handler middleware
      .catch(next);
  });

module.exports = userRouter;