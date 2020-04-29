require('dotenv').config();

const knex = require('knex');
const app = require('./app');
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

const SocketManager = require('./message/socket-manager');

const { PORT, DATABASE_URL } = require('./config');

const db = knex({
  client: 'pg',
  connection: DATABASE_URL
});

app.set('db', db);

io.connection('connection', SocketManager);

server.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});

module.exports.db = db;
module.exports.io = io;