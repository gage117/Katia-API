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

  describe(`POST /api/user`, () => {

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

  describe(`GET /api/user`, () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));
    
    describe('Given a valid user', () => {
      it('responds 200 with serialized user profiles', () => {
        return supertest(app)
          .get('/api/user')
          .expect(200)
          .expect(res => {
            expect(res.body).to.have.property('user_id');
          });
      });
    });
  });

  describe.only(`PATCH /api/user/:userId`, () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));

    describe(`Given valid information to update a user`, () => {
      it(`responds with 203 with the updated user`, () => {
        const newUserData = {
          display_name: 'Gamerduderrrrino',
          bio: 'Im the best'
        };
  
        return supertest(app)
          .patch('/api/user/1')
          .send(newUserData)
          .expect(203)
          .expect(res => {
            expect(res.body).to.have.property('display_name');
            expect(res.body.display_name).to.eql(newUserData.display_name);
            expect(res.body).to.not.have.property('password');
          });
      });
    });

  });
  describe(`GET /api/user/:userId`, () => {});
  
  describe(`GET /api/user/genres/all`, () => {});
  describe(`GET /api/user/:userId/avatar`, () => {});
});