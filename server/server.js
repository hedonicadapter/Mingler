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

async function joinRooms(socket, rooms) {
  return await socket.join(rooms);
}

userIo.on('connection', (socket) => {
  // Get the client's mongoDB ID
  const userID = socket.handshake.query.userID;

  if (userID) {
    // Get friend IDs (array of IDs of mongoDB user objects)
    // by the client's user ID (reference to mongoDB user object)
    User.findById(userID, 'friends', { lean: true }, function (err, result) {
      if (err) throw err;
      const friendIDs = Object.values(result).map(function (item) {
        return item.toString();
      });

      // Client's own UserID is returned by findById
      joinRooms(socket, friendIDs).then(() => {
        socket.on('activity:send', (msg) => {
          // Since a client's friends joins a room by the client's ID on connection,
          // anything emitted to the client's ID will be received by friends
          userIo
            .in(socket.handshake.query.userID)
            .emit('activity:receive', msg);
        });
      });
    });

    userIo.on('disconnect', (reason) => {
      console.log('io disconnected: ', reason);
    });
  }
});
// =========socket end=========

process.on('unhandledRejection', (err, promise) => {
  console.log('Error: ', err);

  server.close(() => process.exit(1));
});
