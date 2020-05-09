const bcrypt = require('bcryptjs');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('User Endpoints', function () {
  let db;

  const testUsers = helpers.makeUsersArray(); 

  const userMatches = helpers.makeMatchesArray();
  const userRejections = helpers.makeRejectionsArray();

  before('make knex instance', () => {
    db = helpers.makeKnexInstance();
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  describe(`GET /api/matched/:userId`, () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));
    beforeEach('insert matches and rejections', () => helpers.seedMatchesAndRejections(db, userMatches, userRejections));

    describe('Given a valid user id', () => {
      it('responds 200 with an array of matched user profiles', () => {
        return supertest(app)
          .get('/api/matched/1')
          .expect(200)
          .expect(res => {
            expect(res.body).to.be.an('array');
            expect(res.body[0]).to.be.an('object');
            expect(res.body[0]).to.have.property('user_id');
            expect(res.body[0]).to.have.property('display_name');
            expect(res.body[0]).to.have.property('bio');
            expect(res.body[0]).to.have.property('avatar');
            expect(res.body[0]).to.have.property('xbox');
            expect(res.body[0]).to.have.property('genres');
            expect(res.body[0]).to.have.property('platforms');
            expect(res.body[0]).to.not.have.property('password');
            expect(res.body[0]).to.not.have.property('email');
          });
      });
    });
  });

});