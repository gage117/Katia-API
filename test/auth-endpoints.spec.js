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

  describe(`POST /api/auth/token`, () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));

    describe('Given valid user login credentials', () => {
      it('responds with 200 and a JWT', () => {
        const userInfo = {
          email: testUser.email,
          password: testUser.password
        };

        return supertest(app)
          .post('/api/auth/token')
          .send(userInfo)
          .expect(200)
          .expect(res => {
            expect(res.body).to.have.property('authToken');
            expect(res.body.authToken).to.be.a('string');
          });
      });
    });
  });

  describe(`PUT /api/auth/token`, () => {});
});
