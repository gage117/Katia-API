const bcrypt = require('bcryptjs');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('User Endpoints', function () {
  let db;

  const testUsers = helpers.makeUsersArray(); 
  const testUser = testUsers[0];
  const fullTestUser = helpers.makeUserInfoAndPlatformsAndGenres(testUser);

  before('make knex instance', () => {
    db = helpers.makeKnexInstance();
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

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
            expect(res.body).to.be.an('array');
            expect(res.body[0]).to.be.an('object');
            expect(res.body[0]).to.have.property('user_id');
            expect(res.body[0]).to.have.property('display_name');
            expect(res.body[0]).to.have.property('bio');
            expect(res.body[0]).to.have.property('lfm_in');
            expect(res.body[0]).to.have.property('avatar');
            expect(res.body[0]).to.have.property('xbox');
            expect(res.body[0]).to.have.property('psn');
            expect(res.body[0]).to.have.property('nintendo');
            expect(res.body[0]).to.have.property('steam');
            expect(res.body[0]).to.have.property('discord');
            expect(res.body[0]).to.have.property('other');
            expect(res.body[0]).to.not.have.property('password');
          });
      });
    });
  });

  describe(`PATCH /api/user/:userId`, () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));

    describe(`Given valid information to update a user`, () => {
      it(`responds with 203 with the updated user`, () => {
        let newUserData = helpers.makeUserInfoAndPlatformsAndGenres(testUser);
        newUserData = newUserData.user_info;

        return supertest(app)
          .patch('/api/user/1')
          .send(newUserData)
          .expect(203)
          .expect(res => {
            expect(res.body).to.have.property('display_name');
            expect(res.body).to.have.property('bio');
            expect(res.body).to.have.property('avatar');
            expect(res.body).to.have.property('lfm_in');
            expect(res.body.display_name).to.eql(newUserData.display_name);
            expect(res.body.bio).to.eql(newUserData.bio);
            expect(res.body.avatar).to.eql(newUserData.avatar);
            expect(res.body.lfm_in).to.eql(newUserData.lfm_in);
            expect(res.body).to.not.have.property('password');
          });
      });
    });

  });
  describe(`GET /api/user/:userId`, () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));

    describe('Given a valid user id', () => {
      it('responds 200 with a the requested user profile', () => {
        return supertest(app)
          .get('/api/user/1')
          .expect(200)
          .expect(res => {
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('display_name');
            expect(res.body).to.have.property('bio');
            expect(res.body).to.have.property('lfm_in');
            expect(res.body).to.have.property('avatar');
            expect(res.body).to.have.property('xbox');
            expect(res.body).to.have.property('psn');
            expect(res.body).to.have.property('nintendo');
            expect(res.body).to.have.property('steam');
            expect(res.body).to.have.property('discord');
            expect(res.body).to.have.property('other');
            expect(res.body).to.have.property('genres');
            expect(res.body).to.have.property('platforms');
            expect(res.body.display_name).to.eql(fullTestUser.user_info.display_name);
            expect(res.body.bio).to.eql(fullTestUser.user_info.bio);
            expect(res.body.lfm_in).to.eql(fullTestUser.user_info.lfm_in);
            expect(res.body.avatar).to.eql(fullTestUser.user_info.avatar);
            expect(res.body.xbox).to.eql(fullTestUser.user_info.xbox);
            expect(res.body.psn).to.eql(fullTestUser.user_info.psn);
            expect(res.body.nintendo).to.eql(fullTestUser.user_info.nintendo);
            expect(res.body.steam).to.eql(fullTestUser.user_info.steam);
            expect(res.body.discord).to.eql(fullTestUser.user_info.discord);
            expect(res.body.other).to.eql(fullTestUser.user_info.other);
            expect(res.body.genres[0]).to.eql(fullTestUser.genres);
            expect(res.body.platforms[0]).to.eql(fullTestUser.platforms);
            expect(res.body).to.not.have.property('password');
          });
      });
    });
  });
  
  describe(`GET /api/user/genres/all`, () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));

    describe('Given a valid request', () => {
      it('responds 200 with a list of all available genres', () => {
        return supertest(app)
          .get('/api/user/genres/all')
          .expect(200)
          .expect(res => {
            expect(res.body).to.be.an('array');
            expect(res.body[0]).to.be.an('object');
            expect(res.body[0].genre).exist;
            expect(res.body[0].genre).to.be.an('string');
            expect(res.body).to.deep.include(
              {genre: 'MOBA'}, 
              {genre: 'Sports'},
              {genre: 'FPS'},
              {genre: 'MMO'},
              {genre: 'Horror'},
              {genre: 'Racing'},
              {genre: 'Action'},
              {genre: 'Action'},
              {genre: 'Battle Royale'},
              {genre: 'Adventure'},
              {genre: 'RPG'},
              {genre: 'Puzzle'},
              {genre: 'VR'},
              {genre: 'Platformer'},
              {genre: 'Simulation'}
            );
          });
      });
    });

  });
  describe.skip(`POST /api/user/:userId/avatar`, () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));
    beforeEach('remove avatar', () => helpers.removeAvatar(db, testUser.id));
    // TODO Not sure how to simluate the data for this. Looks like its formData
    describe('Given a profile without a default avatar', () => {
      it('responds 200 with the location of the new avatar', () => {

        return supertest(app)
          .post('/api/user/1/avatar')
          .expect(200)
          .expect(res => {
            console.log(res.body);
          });

      });
    });
  });
});