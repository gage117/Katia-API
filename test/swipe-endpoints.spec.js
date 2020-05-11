const bcrypt = require('bcryptjs');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Swipe Endpoints', function () {
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

  describe(`GET /api/swipe/:userId`, () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));
    beforeEach('insert matches and rejections', () => helpers.seedMatchesAndRejections(db, userMatches, userRejections));

    describe('Given a valid request', () => {
      it('responds 200 and returns the users "Swipe Queue"', () => {
        return supertest(app)
          .get('/api/swipe/1')
          .expect(200)
          .expect(res => {
            expect(res.body).to.be.an('object');
            expect(res.body.queue).to.be.an('array');
            expect(res.body.queue[0]).to.be.an('object');
            expect(res.body.queue[0]).to.have.property('id');
            expect(res.body.queue[0]).to.have.property('display_name');
            expect(res.body.queue[0]).to.have.property('bio');
            expect(res.body.queue[0]).to.have.property('lfm_in');
            expect(res.body.queue[0]).to.have.property('avatar');
            expect(res.body.queue[0]).to.have.property('genres');
            expect(res.body.queue[0]).to.have.property('platforms');
            expect(res.body.queue[0].genres).to.be.an('array');
            expect(res.body.queue[0].platforms).to.be.an('array');
          });
      });
    });
  });


  describe(`POST /api/swipe/:userId`, () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));
    beforeEach('insert matches and rejections', () => helpers.seedMatchesAndRejections(db, userMatches, userRejections));

    describe('Given a valid match', () => {
      it('returns 201 with a string "match created"', () => {
        const userId = { id: 6 };

        return supertest(app)
          .post('/api/swipe/1')
          .send(userId)
          .expect(201)
          .expect(res => {
            expect(res.body).to.be.a('string');
            expect(res.body).to.eql('match created');
          });
      });
    });
  });


  describe(`POST /api/swipe/reject/:userId`, () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));
    beforeEach('insert matches and rejections', () => helpers.seedMatchesAndRejections(db, userMatches, userRejections));

    describe('Given a valid rejection swipe', () => {
      it('returns 201 with a string "user rejected"', () => {
        const userId = { id: 5 };

        return supertest(app)
          .post('/api/swipe/reject/1')
          .send(userId)
          .expect(201)
          .expect(res => {
            expect(res.body).to.be.a('string');
            expect(res.body).to.eql('user rejected');
          });
      });
    });
  });
});