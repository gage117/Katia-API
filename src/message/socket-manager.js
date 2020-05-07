const MessageService = require('./message-service');

// All currently connected users
// { <userId>: <socket> }
const connectedSockets = {};

module.exports = socket => {
  console.log('Socket.IO listening...');

  // Handles when a user Connects
  socket.on('newUser', userId => {
    // Add user to connectedSockets Object
    connectedSockets[userId] = socket.id;

    // send newUser event to all connected sockets
    socket.broadcast.emit('newUser', userId);
  });

  // Handles when a user opens a chat
  socket.on('chatOpen', users => {
    // Get or Create a conversation for the two users
    MessageService.findOrCreateConversation(users.userId, users.receiverId)
      .then(conversation => {
        // Send conversation id to client to store in state
        socket.emit('conversationId', conversation.id);
        // Get all previous message history for the conversation, if any
        MessageService.getMessagesForConversation(conversation.id)
          .then(messages => {
            // Send all previous messages back to user
            socket.emit('priorMessages', messages);
          });
      });
  });

  // Handles when a user submits a message
  socket.on('message', ({ text, sender_id, receiver_id }) => {
    // Create a message record in database
    MessageService.createMessage(text, sender_id, receiver_id)
      .then(message => {
        // Send the message back to user
        socket.emit('incomingMessage', message);
        // Get the recievers Socket
        const receiverSocketId = connectedSockets[receiver_id];
        // Send the message to the reciever
        socket.to(receiverSocketId).emit('incomingMessage', message);
      });
  });
};