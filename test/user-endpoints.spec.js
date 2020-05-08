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
          email: 'tester123@gmail.com',
          password: 'Password1!',
          display_name: 'gamerdude22'
        };

        return supertest(app)
          .post('/api/user')
          .send(newUser)
          .expect(201)
          .expect(res => {
            expect(res.body).to.have.property('id');
            expect(res.body.username).to.eql(newUser.username);
            expect(res.body.name).to.eql(newUser.name);
            expect(res.body).to.not.have.property('password');
            expect(res.headers.location).to.eql(`/api/user/${res.body.id}`);
          });
      });
    });
  });

});