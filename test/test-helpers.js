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
      password: 'Password1!'
    },
    {
      id: 2,
      email: 'testuser2@gmail.com',
      password: 'Password2!'
    },
    {
      id: 3,
      email: 'testuser3@gmail.com',
      password: 'Password3!'
    },
    {
      id: 4,
      email: 'testuser4@gmail.com',
      password: 'Password4!'
    },
    {
      id: 5,
      email: 'testuser5@gmail.com',
      password: 'Password5!'
    },
    {
      id: 6,
      email: 'testuser6@gmail.com',
      password: 'Password6!'
    }
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
      {
        email: 'testuser3@gmail.com',
        password: 'Password3!'
      },
      {
        email: 'testuser4@gmail.com',
        password: 'Password4!'
      },
      {
        email: 'testuser5@gmail.com',
        password: 'Password5!'
      },
      {
        email: 'testuser6@gmail.com',
        password: 'Password6!'
      }
    ];
}
/**
 * creates matches for the user_matches table
 * @returns {array} of user matches objects
 */
function makeMatchesArray() {
    return [
         {
          user_id: 1,
          match_user_id: 2
        },
        {
          user_id: 1,
          match_user_id: 4
        },
        {
          user_id: 2,
          match_user_id: 1
        },
        {
          user_id: 2,
          match_user_id: 5
        },
        {
          user_id: 3,
          match_user_id: 4
        },
        {
          user_id: 4,
          match_user_id: 3
        },
        {
          user_id: 5,
          match_user_id: 2
        },
        {
          user_id: 6,
          match_user_id: 5
        }
    ];
}

/**
 * creates rejections for the user_rejections table
 * @returns {array} of user rejection objects
 */
function makeRejectionsArray() {
    return [
        {
            user_id: 1,
            match_user_id: 3
          },
          {
            user_id: 2,
            match_user_id: 4
          },
          {
            user_id: 2,
            match_user_id: 6
          },
          {
            user_id: 3,
            match_user_id: 5
          },
          {
            user_id: 4,
            match_user_id: 1
          },
          {
            user_id: 5,
            match_user_id: 6
          },
          {
            user_id: 6,
            match_user_id: 2
          }
    ];
}

/**
 * generate fixtures of user info, platforms and genres for a given user
 * @param {object} user - contains `id` property
 * @returns {Object(user_info, platforms, genres)} - object of user_info, platforms, and genres. Platforms and genres are arrays.
 */
function makeUserInfoAndPlatformsAndGenres(user) {
  const user_info = {
    display_name: `GamerDude${user.id}`,
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
  };
  const platforms = user.id % 2 === 0 ? 'PC' : 'Xbox';
  const genres =  user.id % 2 === 0 ? 'FPS' : 'RPG';

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
 * and inserts user_info, user_platforms, and user_genres
 * @param {knex instance} db
 * @param {array} users - array of user objects for insertion
 * @returns {Promise} - when users, user_info, user_platforms, and user_genres  tables are seeded
 */
function seedUsers(db, users){
    const preppedUsers = users.map(user => ({
        ...user,
        password: bcrypt.hashSync(user.password, 1)
      }));
    
    const preppedInfo = users.map(user => ({
        display_name: `GamerDude${user.id}`,
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

    const preppedPlatforms = users.map(user => ({
        user_id: user.id,
        platform: user.id % 2 === 0 ? 'PC' : 'Xbox'
    }));

    const preppedGenres = users.map(user => ({
        user_id: user.id,
        genre: user.id % 2 === 0 ? 'FPS' : 'RPG'
    }));

      return db.transaction(async trx => {
        await trx.into('users').insert(preppedUsers);
    
        await trx.raw(
          `SELECT setval('users_id_seq', ?)`,
          [users[users.length - 1].id]
        );

        await trx.into('user_info').insert(preppedInfo);
        await trx.into('user_platforms').insert(preppedPlatforms);
        await trx.into('user_genres').insert(preppedGenres);
      });
    
}
/**
 * insert users into db with bcrypted passwords and update sequence
 * and inserts user_info, user_platforms, and user_genres
 * @param {knex instance} db
 * @param {array} matches - array of match objects for insertion
 * @param {array} rejections - array of rejection objects for insertion
 * @returns {Promise} - when user_matches and user_rejections tables are seeded
 */
function seedMatchesAndRejections(db, matches, rejections){

    return db.transaction(async trx => {
        await trx.into('user_matches').insert(matches);
        await trx.into('user_rejections').insert(rejections);
    });
}

module.exports = {
  makeKnexInstance,
  makeUsersArray,
  makeMatchesArray,
  makeRejectionsArray,
  makeUserInfoAndPlatformsAndGenres,
  makeAuthHeader,
  cleanTables,
  seedUsers,
  seedMatchesAndRejections,
  makeSeedUsersArray
};