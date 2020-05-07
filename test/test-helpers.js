const knex = require('knex');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * create a knex instance connected to postgres
 * @returns {knex instance}
 */
function makeKnexInstance() {
  return knex({
    client: 'pg',
    connection: process.env.TEST_DATABASE_URL,
  });
}

/**
 * create a users from the Users table
 * @returns {array} of user objects
 */
function makeUsersArray() {
  return [
    {
      id: 1,
      email: 'testuser1@gmail.com',
      password: 'password',
      date_joined: '2020-05-01 15:55:01'
    },
    {
      id: 2,
      email: 'testuser2@gmail.com',
      password: 'password',
      date_joined: '2020-05-01 15:55:02'
    },
  ];
}

/**
 * generate fixtures of user info, platforms and genres for a given user
 * @param {object} user - contains `id` property
 * @returns {Object(user_info, platforms, genres)} - object of user_info, platforms, and genres. Platforms and genres are arrays.
 */
function makeUserInfoAndPlatformsAndGenres(user) {
  const user_info = {
    display_name: 'GamerDude22',
    bio: 'I like games',
    lfm_in: 'Fortnite,COD Warzone,Overwatch',
    avatar: 'https://katia-app.s3-us-west-1.amazonaws.com/default_avatar.png',
    user_id: user.id,
    psn: 'kratos22',
    xbox: 'spartan22',
    nintendo: 'mario22',
    steam: 'gordonFreeman22',
    discord: 'bringBackTeamspeak22',
    other: 'BattleNet: gamerdude22#3572'
  };
  const platforms = ['PC', 'Xbox'];
  const genres = ['FPS', 'MOBA', 'Simulation'];

  return { user_info, platforms, genres };
}

/**
 * make a bearer token with jwt for authorization header
 * @param {object} user - contains `id`, `username`
 * @param {string} secret - used to create the JWT
 * @returns {string} - for HTTP authorization header
 */
function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.username,
    algorithm: 'HS256',
  });
  return `Bearer ${token}`;
}