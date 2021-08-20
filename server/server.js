require('dotenv').config({ path: './config.env' });
const express = require('express');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const ErrorResponse = require('./utils/errorResponse');
const User = require('./models/User');

connectDB();

const app = express();

// =========middleware start=========
app.use(express.json());

// Catches any request to /api/auth and redirects it to ./routes/auth
app.use('/api/auth', require('./routes/auth'));
app.use('/api/private', require('./routes/private'));

app.use(errorHandler);
// =========middleware end=========

const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => console.log('server running on ' + PORT));

// =========socket start=========
const io = require('socket.io')(server);

const userIo = io.of('/user');

userIo.use((socket, next) => {
  // Get the client's mongodb _id
  const token = socket.handshake.auth.token;

  if (token) {
    socket.user = validateToken(token);

    next();
  } else {
    next(new ErrorResponse('No token found', 404));
  }
});

async function getFriendIDsByClientID(userID) {
  return User.findById(userID, 'friends', function (err, result) {
    if (err) throw err;
    return result;
  });
}

function validateToken(token) {
  return true;
}

userIo.on('connection', (socket) => {
  // Get the client's mongoDB ID
  const userID = socket.handshake.query.userID;

  if (userID) {
    // Join a room by the client's own ID
    socket.join(userID);

    // Get friend IDs (array of IDs of mongoDB user objects)
    // by the client's user ID (reference to mongoDB user object)
    User.findById(userID, 'friends', { lean: true }, function (err, result) {
      if (err) throw err;
      const friendIDs = Object.values(result);

      // Join rooms by each friend's mongoDB user ID
      friendIDs.forEach((friend) => {
        socket.join(friend);
      });
    });
    console.log('roomss', socket.rooms);
  }

  socket.on('activity', (msg) => {
    // Since a client's friends joins a room by the client's ID on connection,
    // anything emitted to the client's ID will be received by friends
    socket.broadcast
      .to(socket.handshake.query.userID)
      .emit('private message', socket.id, msg);
  });

  // console.log('io connected: ', socket.id);
  userIo.emit('big', 'yo');

  userIo.on('disconnect', (reason) => {
    console.log('io disconnected: ', reason);
  });
});
// =========socket end=========

process.on('unhandledRejection', (err, promise) => {
  console.log('Error: ', err);

  server.close(() => process.exit(1));
});
