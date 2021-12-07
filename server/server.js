const User = require('./models/User');
const connectDB = require('./config/db');
require('dotenv').config({ path: './config.env' });
const express = require('express');
const errorHandler = require('./middleware/error');
const ErrorResponse = require('./utils/errorResponse');

connectDB();

const app = express();

// =========middleware start=========
app.use(express.json());

// Catches any request to /api/auth and redirects it to ./routes/auth
app.use('/api/auth', require('./routes/auth'));
app.use('/api/private', require('./routes/private'));
app.use('/api/token', require('./routes/token'));

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

userIo.on('connection', async (socket) => {
  // Get the client's mongoDB ID
  const userID = socket.handshake.query.userID;

  if (userID) {
    const friends = await User.findById(
      userID,
      { _id: 0 },
      { lean: true },
      function (err, result) {
        if (err) {
          console.log('userIo on connection error: ', err);
          return err;
        }
      }
    ).select({ friends: 1 });

    const friendIDs = Object.values(friends.friends).map(function (item) {
      return item.toString();
    });

    socket.join(userID);
    // Client's own UserID is also returned by findById
    // joinRooms(socket, friendIDs).then(() => {
    socket.on('activity:send', (packet) => {
      // Since a client's friends joins a room by the client's ID on connection,
      // anything emitted to the client's ID will be received by friends
      userIo.in(friendIDs).emit('activity:receive', packet);
    });

    // User wants to send time request to a friend
    socket.on('youtubetimerequest:send', (packet) => {
      const { toID, fromID, YouTubeTitle, YouTubeURL } = packet;
      // Time request is sent to friend
      userIo.in(toID).emit('youtubetimerequest:receive', {
        fromID: fromID,
        YouTubeTitle: YouTubeTitle,
        YouTubeURL: YouTubeURL,
      });
    });

    // Friend answers time request
    socket.on('youtubetimerequest:answer', (packet) => {
      const { toID, time } = packet;
      //By sending current youtube time back
      userIo.in(toID).emit('youtubetime:receive', time);
    });

    socket.on('friendrequest:send', (packet) => {
      const { toID } = packet;
      userIo.in(toID).emit('friendrequest:receive');
    });

    socket.on('friendrequest:cancel', (packet) => {
      const { toID } = packet;
      userIo.in(toID).emit('friendrequest:cancelreceive');
    });

    userIo.on('disconnect', (reason) => {
      console.log('io disconnected: ', reason);
    });
  } else console.error('No userID in handshake');
});
// =========socket end=========

process.on('unhandledRejection', (err, promise) => {
  console.log('Error: ', err);

  server.close(() => process.exit(1));
});
