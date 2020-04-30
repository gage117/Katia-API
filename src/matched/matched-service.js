const MatchedService = {
  // gets a users matches
  getUserMatches(db, user_id) {
    return db('user_matches')
      .select('match_user_id')
      .where({
        user_id
      });
  },
  // TODO add GamerID when it gets added to the DB
  getUserInfo(db, user_id) {
    return db('user_info')
      .select('user_id', 'display_name', 'bio', 'lfm_in', 'avatar')
      .where({
        user_id
      })
      .first();
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
  },
  // Remove a match if the user is in their own user_matches table by some error
  //! This should never happen in normal circumstances and is almost certainly an error unless otherwise specified
  removeSelfMatch(db, user_id) {
    return db('user_matches')
      .where({ user_id })
      .andWhere('match_user_id', user_id)
      .del();
  },
  // TODO
  serializeMatched(matched){}
};

module.exports = MatchedService;