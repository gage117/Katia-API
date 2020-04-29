const MatchedService = {
  // gets a users matches
  getUserMatches(db, user_id) {
    return db('user_matches')
      .select('match_user_id')
      .where({
        user_id
      });
  },
  // checks if a match exists betweeen the users
  // Returns true / false
  matchExists(db, user_id, match_user_id) {
    return db('user_matches')
      .select('*')
      .where({ user_id })
      .andWhere({ match_user_id })
      .first()
      .then(match => !!match);
  }
};

module.exports = MatchedService;