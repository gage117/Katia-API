const MessageService = {
  saveMessage(db, data) {
    return db
      .insert(data)
      .into('user_messages');
  },

  getAllMessagesBetweenUsers(db, userOne, userTwo) {
    return db
      .select('*')
      .from('user_messages')
      .where({ sender: userOne, receiver: userTwo })
      .andWhere({ sender: userTwo, receiver: userOne });
  }
};

module.exports = MessageService;