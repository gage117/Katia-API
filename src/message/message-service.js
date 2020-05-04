const knex = require('knex');

const { DATABASE_URL } = require('../config');

const db = knex({
  client: 'pg',
  connection: DATABASE_URL
});

const MessageService = {
  findOrCreateConversation(user1id, user2id) {
    return db.transaction(trx => {
      trx('conversations')
        .whereIn('user1id', [user1id, user2id])
        .orWhereIn('user2id', [user1id, user2id])
        .first()
        .then(conversation => {
          if(conversation) {
            return conversation;
          } else {
            return trx('conversations')
              .insert({
                user1id,
                user2id
              })
              .returning('*')
              .then(([newConversation]) => { 
                return newConversation;
              });
          }
        })
        .then(trx.commit)
        .catch(trx.rollback);
    });
  },

  createMessage(message, sender_id, receiver_id) {
    return this.findOrCreateConversation(sender_id, receiver_id).then(conversation => {
      return db('messages')
        .insert({ 
          conversation_id: conversation.id,
          sender_id,
          message
        })
        .returning('*')
        .then(([newMessage]) => { 
          return newMessage;
        });
    });
  },

  getMessagesForConversation(conversation_id) {
    return db('messages')
      .select('*')
      .where({ conversation_id });
  }
};

module.exports = MessageService;