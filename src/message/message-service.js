const knex = require('knex');

const { DATABASE_URL } = require('../config');

//TODO: Figure out a way to not have to create another knex instance here
const db = knex({
  client: 'pg',
  connection: DATABASE_URL
});

const MessageService = {
  // Finds a conversation for two users or creates one if none exists 
  findOrCreateConversation(user1id, user2id) {
    return db.transaction(trx => {
      // First try to find an existing conversation
      trx('conversations')
        .where('user1id', 'in', [user1id, user2id])
        .andWhere('user2id', 'in', [user1id, user2id])
        .first()
        .then(conversation => {
          // If the conversation was found return it
          if(conversation) {
            return conversation;
          } else {
            // Otherwise create a new conversation and return it
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

  // Creates a message record in the database
  createMessage(message, sender_id, receiver_id) {
    // First find their conversation
    return this.findOrCreateConversation(sender_id, receiver_id).then(conversation => {
      // Then create the message
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

  // Gets all message history for a conversation
  getMessagesForConversation(conversation_id) {
    return db('messages')
      .select('*')
      .where({ conversation_id });
  }
};

module.exports = MessageService;