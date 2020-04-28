const bcrypt = require('bcryptjs');
const xss = require('xss');

// regex to compare against for password requirements
const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;

const UserService = {
  // get every user from database
  getAllUsers(db) {
    return db('users')
      .select('*');
  },

  // get every user profile info from database
  getAllProfiles(db) {
    return db('user_info')
      .select('*');
  },

  // get a user by their id
  getById(db, id) {
    return db
      .from('users')
      .select('*')
      .where({
        id
      })
      .first();
  },

  // get a user by their email
  getByEmail(db, email) {
    return db
      .from('users')
      .select('*')
      .where({
        email
      })
      .first();
  },

  // check if an email already exists
  hasUserWithEmail(db, email) {
    return db('users')
      .where({ email })
      .first()
      .then(user => !!user);
  },

  // insert a new user
  insertUser(db, newUser) {
    return db
      .insert(newUser)
      .into('users')
      .returning('*')
      .then(([user]) => user);
  },

  // insert a new user profile info
  insertUserInfo(db, newInfo) {
    return db
      .insert(newInfo)
      .into('user_info')
      .returning('*')
      .then(([info]) => info);
  },

  // update an existing user
  updateUser(db, id, newUserFields) {
    return db('user_info')
      // .innerJoin('users', 'user_info.user_id', 'users.id')
      .where('user_info.user_id', id)
      .update(newUserFields)
      .returning('*');
  },

  saveAvatar(db, user_id, imageLocation) {
    return db('user_info')
      .where({ user_id })
      .update({ avatar: imageLocation })
      .returning('*');
  },

  // gets a users profile info
  getUserInfo(db, user_id) {
    return db('user_info')
      .select('display_name', 'bio', 'lfm_in', 'avatar')
      .where({
        user_id
      })
      .first();
  },

  // insert a match for a user
  insertMatch(db, user_id, match_user_id) {
    return db
      .insert({ user_id, match_user_id })
      .into('user_matches')
      .returning('*')
      .then(([match]) => match);
  },

  // remove a match
  removeMatch(db, user_id, match_user_id) {
    return db('user_matches')
      .where({ user_id })
      .andWhere({ match_user_id })
      .del()
      .then(() => {
        return db('user_matches')
          .where({ user_id: match_user_id })
          .andWhere({ match_user_id: user_id })
          .del();
      });
  },

  // gets a users preferred genres
  getUserGenres(db, user_id) {
    return db('user_genres')
      .select('genre')
      .where({
        user_id
      });
  },

  // updates a users preferred genres
  updateGenresForUser(db, user_id, genres) {
    return db.transaction(trx => {
      db('user_genres')
        .where({ user_id })
        .del()
        .transacting(trx)
        .then(() => {
          const newRows = genres.map(genre => {
            return {
              user_id,
              genre
            };
          });
          return db
            .insert(newRows)
            .into('user_genres')
            .transacting(trx);
        })
        .then(trx.commit)
        .catch(trx.rollback);
    });
  },

  // check if a user has a genre
  hasGenre(db, user_id, genre) {
    return db('user_genres')
      .where({ user_id })
      .andWhere({ genre })
      .first()
      .then(row => !!row);
  },

  // gets a users platforms
  getUserPlatforms(db, user_id) {
    return db('user_platforms')
      .select('platform')
      .where({
        user_id
      });
  },

  // updates a users platforms
  updatePlatformsForUser(db, user_id, platforms) {
    return db.transaction(trx => {
      db('user_platforms')
        .where({ user_id })
        .del()
        .transacting(trx)
        .then(() => {
          const newRows = platforms.map(platform => {
            return {
              user_id,
              platform
            };
          });
          return db
            .insert(newRows)
            .into('user_platforms')
            .transacting(trx);
        })
        .then(trx.commit)
        .catch(trx.rollback);
    });
  },

  // check if a user has a platform
  hasPlatform(db, user_id, platform) {
    return db('user_platforms')
      .where({ user_id })
      .andWhere({ platform })
      .first()
      .then(row => !!row);
  },

  // check if password passes requirements (> 8 characters, < 72 characters, no spaces at ends, Upper case, lower case, number, special character)
  validatePassword(password) {
    if (password.length < 8) {
      return 'Password must be longer than 8 characters';
    }
    if (password.length > 72) {
      return 'Password must be less than 72 characters';
    }
    if (password.startsWith(' ') || password.endsWith(' ')) {
      return 'Password must not start or end with empty spaces';
    }
    if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
      return 'Password must contain one upper case, lower case, number and special character';
    }
    return null;
  },

  // has a users password for storing
  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },

  // serialize an array of user profile + accounts
  serializeFullUsers(users) {
    return users.map(this.serializeUser);
  },

  // serialize a users profile and account for protection against SQL injection attacks
  serializeFullUser(user) {
    return {
      id: user.id,
      email: xss(user.email),
      display_name: xss(user.display_name),
      bio: xss(user.bio),
      lfm_in: xss(user.lfm_in),
      avatar: user.avatar
    };
  },

  // serialize an array of user profiles
  serializeProfiles(profiles) {
    return profiles.map(this.serializeProfile);
  },

  // serialize a user profile
  serializeProfile(profile) {
    return {
      user_id: profile.user_id,
      display_name: xss(profile.display_name),
      bio: xss(profile.bio),
      lfm_in: xss(profile.lfm_in),
      avatar: profile.avatar
    };
  }
};

module.exports = UserService;