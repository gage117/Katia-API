const SwipeService = {
  getQueueForUser(db, userId) {
    return db
      .select('id', 'display_name', 'bio', 'lfm_in', 'avatar')
      .from('users')
      .innerJoin('user_info', 'users.id', 'user_info.user_id')
      .whereNot('users.id', userId);
  },

  // gets a users matches
  getUserMatches(db, user_id) {
    return db('user_matches')
      .select('match_user_id')
      .where({
        user_id
      });
  },

  addUserMatch(db, user_id, match_user_id) {
    return db
      .insert({ user_id, match_user_id })
      .into('user_matches');
  },

  matchExists(db, user_id, match_user_id) {
    return db('user_matches')
      .select('*')
      .where({ user_id })
      .andWhere({ match_user_id })
      .first()
      .then(match => !!match);
  }
};

module.exports = SwipeService;