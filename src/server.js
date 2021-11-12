require('dotenv').config();

// Knex, used for database operations
const knex = require('knex');
// Main express app
const app = require('./app');
// HTTP server from Express app
const server = require('http').createServer(app);
// Socket.IO connected to server
const io = require('socket.io').listen(server, {
  // Custom Cors middleware for Socket.IO
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

// Exported function which handles Socket.IO listeners
const SocketManager = require('./message/socket-manager');

const { PORT, DATABASE_URL } = require('./config');

// Create knex isntance
const db = knex({
  client: 'pg',
  connection: {
    connectionString: DATABASE_URL,
    SSL: true
  }
});

// Set knex instance in app for easy access
app.set('db', db);

// Setup Socket.IO
io.on('connection', SocketManager);

// Start server on given PORT
server.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});