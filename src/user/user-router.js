const express = require('express');
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');
const multer = require('multer');
const path = require('path');
const url = require('url');

const config = require('../config');

const UserService = require('./user-service');
const SwipeService = require('../swipe/swipe-service');

const userRouter = express.Router();
const bodyParser = express.json();

const s3 = new aws.s3({
  accessKeyId: config.AWS_ACCESS_KEY,
  secretAccessKey: config.AWS_SECRET_KEY,
  Buclet: config.AWS_BUCKET
});

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

    if(lfm_in.split(',').length > 3) {
      return res.status(400).json({
        error: '"lfm_in" must be a max of 3 games, seperated by commas'
      });
    }

    UserService.updateUser(
      req.app.get('db'),
      req.params.userId,
      profileToUpdate
    )
      .then(user => {
        if(genres) {
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
      lfm_in: profile.lfm_in.split(','),
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
  .route('/:userId/avatar')
  .post(checkUserExists, (req, res, next) => {
    profileImgUpload(req, res, (error) => {
      if(error) {
        res.json({ error });
      } else {
        if(req.file === undefined) {
          res.json({ error: 'No file selected' });
        } else {
          const imageName = req.file.key;
          const imageLocation = req.file.location;

          UserService.saveAvatar(
            req.app.get('db'),
            req.params.userId,
            imageName
          )
            .then(() => {
              res.json({ 
                image: imageName ,
                location: imageLocation
              });
            })
            .catch(next);
        }
      }
    });
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

const profileImgUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: config.AWS_BUCKET,
    acl: 'public-read',
    key: (req, file, cb) => {
      cb(null, path.basename(file.originalname, path.extname(file.originalname)) + '-' + Date.now() + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 2000000
  },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).single('profileImage');

function checkFileType(file, cb) {
  const fileTypes = /jpeg|jpg|png|gif/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = fileTypes.test(file.mimetype);

  if(mimeType && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

module.exports = userRouter;