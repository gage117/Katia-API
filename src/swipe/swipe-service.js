const SwipeService = {
  // Returns array of profile objects for all of a users matches
  getMatchesTableInfo(db, userId) {
    return db
      .select('id', 'display_name', 'bio', 'lfm_in', 'avatar')
      .from('users')
      .innerJoin('user_info', 'users.id', 'user_info.user_id')
      .innerJoin('user_matches', 'users.id', 'user_matches.match_user_id')
      .where('user_matches.user_id', userId);
  },

  // Returns array of profile objects for all of a users rejections
  getRejectionsTableInfo(db, userId) {
    return db
      .select('id', 'display_name', 'bio', 'lfm_in', 'avatar')
      .from('users')
      .innerJoin('user_info', 'users.id', 'user_info.user_id')
      .innerJoin('user_rejections', 'users.id', 'user_rejections.match_user_id')
      .where('user_rejections.user_id', userId);
  },

  // Gets all registered users from DB
  getAllUsers(db, userId) {
    return db
      .select('id', 'display_name', 'bio', 'lfm_in', 'avatar')
      .from('users')
      .innerJoin('user_info', 'users.id', 'user_info.user_id')
      .whereNot('users.id', userId);
  },

  // Gets all of a users matches
  getUserMatches(db, user_id) {
    return db('user_matches')
      .select('match_user_id')
      .where({
        user_id
      });
  },

  // Adds a match to the DB
  addUserMatch(db, user_id, match_user_id) {
    return db
      .insert({ user_id, match_user_id })
      .into('user_matches');
  },

  // Checks if a match exists in the DB
  matchExists(db, user_id, match_user_id) {
    return db('user_matches')
      .select('*')
      .where({ user_id })
      .andWhere({ match_user_id })
      .first()
      .then(match => !!match);
  },

  // Checks if a rejection exists in DB
  rejectExists(db, user_id, match_user_id) {
    return db('user_rejections')
      .select('*')
      .where({ user_id})
      .andWhere({ match_user_id })
      .first()
      .then(match => !!match);
  },

  // Adds a rejection to the DB
  addRejection(db, user_id, match_user_id) {
    return db
      .insert({ user_id, match_user_id })
      .into('user_rejections');
  },
};

module.exports = SwipeService;