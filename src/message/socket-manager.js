const io = require('../server').io;
const db = require('../server').db;
const MessageService = require('./message-service');

const users = {};

module.exports = (socket) => {
  socket.on('new user', (data, callback) => {
    if(data in users) {
      callback(false);
    } else {
      callback(true);
      socket.userId = data;
      users[socket.userId] = socket;
      updateUsers();
    }
  });

  socket.on('disconnect', (data) => {
    if(!socket.userId) return;
    delete users[socket.userId];
    updateUsers();
  });

  socket.on('send message', (data, callback) => {
    if(data.receiver in users) {
      users[data.receiver].emit('message received', data);
    }
    MessageService.saveMessage(
      db,
      data
    );
  });

  const updateUsers = () => {
    io.sockets.emit('users', Object.keys(users));
  };
};