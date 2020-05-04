require('dotenv').config();

const knex = require('knex');
const app = require('./app');
const server = require('http').createServer(app);
const io = require('socket.io').listen(server, {
  handlePreflightRequest: (req, res) => {
    const headers = {
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Origin': req.headers.origin,
      'Access-Control-Allow-Credentials': true
    };
    res.writeHead(200, headers);
    res.end();
  }
});

const SocketManager = require('./message/socket-manager');

const { PORT, DATABASE_URL } = require('./config');

const db = knex({
  client: 'pg',
  connection: DATABASE_URL
});

app.set('db', db);

io.on('connection', SocketManager);

server.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});