const SwipeService = {
  // getQueueForUser(db, userId) {
  //   return db
  //     .select('id', 'display_name', 'bio', 'lfm_in', 'avatar')
  //     .from('users')
  //     .innerJoin('user_info', 'users.id', 'user_info.user_id')
  //     .whereNot('users.id', userId);
  // },

  getMatchesTableInfo(db, userId) {
    return db
      .select('id', 'display_name', 'bio', 'lfm_in', 'avatar')
      .from('users')
      .innerJoin('user_info', 'users.id', 'user_info.user_id')
      .innerJoin('user_matches', 'users.id', 'user_matches.match_user_id')
      .where('user_matches.user_id', userId)
        // .then(users => {
        // return db
        // .select('id', 'display_name', 'bio', 'lfm_in', 'avatar')
        // .from('users')
        // .innerJoin('user_info', 'users.id', 'user_info.user_id')
        // .whereNot('users.id', ...users.map(item => item.id))
        // .andWhereNot('users.id', userId)

        // .select('id', 'display_name', 'bio', 'lfm_in', 'avatar')
        // .from('users')
        // .innerJoin('user_info', 'users.id', 'user_info.user_id')
        // .innerJoin('user_rejections', 'users.id', 'user_rejections.match_user_id')
        // .where('user_rejections.user_id', userId)
  },

  getRejectionsTableInfo(db, userId) {
    return db
      .select('id', 'display_name', 'bio', 'lfm_in', 'avatar')
      .from('users')
      .innerJoin('user_info', 'users.id', 'user_info.user_id')
      .innerJoin('user_rejections', 'users.id', 'user_rejections.match_user_id')
      .where('user_rejections.user_id', userId)
  },

  getAllUsers(db, userId) {
    return db
    .select('id', 'display_name', 'bio', 'lfm_in', 'avatar')
    .from('users')
    .innerJoin('user_info', 'users.id', 'user_info.user_id')
    .whereNot('users.id', userId)
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
  },

  rejectExists(db, user_id, match_user_id) {
    return db('user_rejections')
    .select('*')
    .where({ user_id})
    .andWhere({ match_user_id })
    .first()
    .then(match => !!match)
  },

  addRejection(db, user_id, match_user_id) {
    return db
    .insert({ user_id, match_user_id })
    .into('user_rejections')
  },
};

module.exports = SwipeService;