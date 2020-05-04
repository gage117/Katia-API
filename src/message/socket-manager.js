const MessageService = require('./message-service');

const mobileSockets = {};

module.exports = socket => {
  console.log('Socket.IO listening...');

  socket.on('newUser', userId => {
    mobileSockets[userId] = socket.id;
    socket.broadcast.emit('newUser', userId);
  });

  socket.on('chatOpen', users => {
    MessageService.findOrCreateConversation(users.userId, users.receiverId)
      .then(conversation => {
        MessageService.getMessagesForConversation(conversation.id)
          .then(messages => {
            socket.emit('priorMessages', messages);
          });
      });
  });

  socket.on('message', ({ text, sender_id, receiver_id }) => {
    MessageService.createMessage(text, sender_id, receiver_id)
      .then(message => {
        socket.emit('incomingMessage', message);
        const receiverSocketId = mobileSockets[receiver_id];
        socket.to(receiverSocketId).emit('incomingMessage', message);
      });
  });
};