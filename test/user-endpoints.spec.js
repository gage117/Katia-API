const bcrypt = require('bcryptjs');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('User Endpoints', function () {
  let db;

  const testUsers = helpers.makeUsersArray(); 
  const testUser = testUsers[0];

  before('make knex instance', () => {
    db = helpers.makeKnexInstance();
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  //! The code above is almost a boilerplate for most tests

  describe(`GET /api/user`, () => {
    // beforeEach('insert users', () => helpers.seedUsers(db, testUsers));

    describe(`Given a valid user`, () => {
      it(`responds with 201, serialized user with no password`, () => {
        const newUser = {
          email: 'tester123@ymail.com',
          password: 'password',
          display_name: 'gamerdude22'
        };
      })
    })
  });

});