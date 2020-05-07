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