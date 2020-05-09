const knex = require('knex');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// TODO makeMatches

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
      password: 'Password1!'
    },
    {
      id: 2,
      email: 'testuser2@gmail.com',
      password: 'Password1!'
    },
  ];
}

function makeSeedUsersArray() {
    return [
      {
        email: 'testuser1@gmail.com',
        password: 'Password1!'
      },
      {
        email: 'testuser2@gmail.com',
        password: 'Password1!'
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

function makeUserInfo(users) {
    const preppedUserInfo = [];
    for(let i = 0; i < users.length; i++) {
        preppedUserInfo.push({
            display_name: 'GamerDude22',
            bio: 'I like games',
            lfm_in: 'Fortnite,COD Warzone,Overwatch',
            avatar: 'https://katia-app.s3-us-west-1.amazonaws.com/default_avatar.png',
            user_id: users[i].id,
            psn: 'kratos22',
            xbox: 'spartan22',
            nintendo: 'mario22',
            steam: 'gordonFreeman22',
            discord: 'bringBackTeamspeak22',
            other: 'BattleNet: gamerdude22#3572'
           })
    }
    // users.forEach(user => {
    //     preppedUserInfo.push({
    //         display_name: 'GamerDude22',
    //         bio: 'I like games',
    //         lfm_in: 'Fortnite,COD Warzone,Overwatch',
    //         avatar: 'https://katia-app.s3-us-west-1.amazonaws.com/default_avatar.png',
    //         user_id: user.id,
    //         psn: 'kratos22',
    //         xbox: 'spartan22',
    //         nintendo: 'mario22',
    //         steam: 'gordonFreeman22',
    //         discord: 'bringBackTeamspeak22',
    //         other: 'BattleNet: gamerdude22#3572'
    //        })   
    // });
    return preppedUserInfo;
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
    algorithm: 'HS256'
  });
  return `Bearer ${token}`;
}


/**
 * remove data from tables and reset sequences for SERIAL id fields
 * @param {knex instance} db
 * @returns {Promise} - when tables are cleared
 */
function cleanTables(db) {
  return db.transaction(trx =>
    trx.raw(
      `TRUNCATE
          "users",
          "user_info",
          "user_genres",
          "user_platforms",
          "user_matches",
          "user_rejections",
          "conversations",
          "messages"`
    )
      .then(() =>
        Promise.all([
          trx.raw(`ALTER SEQUENCE users_id_seq minvalue 0 START WITH 1`), //TODO may need id_seq for conversations sna messages
          trx.raw(`SELECT setval('users_id_seq', 0)`)                     //! Not sure if this .then is done or not
        ])
      )
  );
}

/**
 * insert users into db with bcrypted passwords and update sequence
 * @param {knex instance} db
 * @param {array} users - array of user objects for insertion
 * @returns {Promise} - when users table seeded
 */
function seedUsers(db, users){
    const preppedUsers = users.map(user => ({
        ...user,
        password: bcrypt.hashSync(user.password, 1)
      }));
    
    const preppedInfo = users.map(user => ({
        display_name: 'GamerDude22',
        bio: 'I like games',
        lfm_in: 'Fortnite,COD Warzone,Overwatch',
        avatar: 'https://katia-app.s3-us-west-1.amazonaws.com/default_avatar.png',
        user_id: user.id,
        psn: `kratos${user.id}`,
        xbox: `spartan${user.id}`,
        nintendo: `mario${user.id}`,
        steam: `gordonFreeman${user.id}`,
        discord: `bringBackTeamspeak${user.id}`,
        other: `BattleNet: gamerdude${user.id}#35${user.id}`  
    }));

      return db.transaction(async trx => {
        await trx.into('users').insert(preppedUsers);
    
        await trx.raw(
          `SELECT setval('users_id_seq', ?)`,
          [users[users.length - 1].id]
        );

        await trx.into('user_info').insert(preppedInfo);
        // await trx.into('user_platforms').insert(platforms);
        // await trx.into('user_genres').insert(genres);
      });
    
}

function makeMatches() {}
function makeConversationsAndMeeages(){}
function seedUsersAndUserInfoAndPlatformsAndGenres(){}
// TODO seeds for matches and convos

module.exports = {
  makeKnexInstance,
  makeUsersArray,
  makeUserInfoAndPlatformsAndGenres,
  makeAuthHeader,
  cleanTables,
  seedUsers,
  makeSeedUsersArray,
  makeUserInfo
};