const User = require('./models/User');
const connectDB = require('./config/db');
require('dotenv').config({ path: './config.env' });
const express = require('express');
const errorHandler = require('./middleware/error');
const ErrorResponse = require('./utils/errorResponse');
const multer = require('multer');

var bodyParser = require('body-parser');

connectDB();

const app = express();

// =========middleware start=========
app.use(express.json());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

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
  const accessToken = socket.handshake.auth.accessToken;

  if (accessToken) {
    socket.user = validateAccessToken(accessToken);

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

function validateAccessToken(accessToken) {
  return true;
}

async function joinRooms(socket, rooms) {
  return await socket.join(rooms);
}

function setUserStatus(user, friendIDs, status, userIo) {
  user.online = status;
  user.save().then(() => {
    userIo
      .in(friendIDs)
      .emit('user:' + status ? 'online' : 'offline', user._id);
  });
}

async function getUser(userID) {
  return await User.findById(userID, { lean: true }, function (err, result) {
    if (err) {
      console.log('userIo on connection error: ', err);
      return err;
    }
  }).select({ friends: 1 });
}

const onActivitySend = (packet, friendIDs) => {
  // Since a client's friends joins a room by the client's ID on connection,
  // anything emitted to the client's ID will be received by friends
  userIo.in(friendIDs).emit('activity:receive', packet);
};

userIo.on('connection', async (socket) => {
  console.log('userIo connected');
  // Get the client's mongoDB ID
  const userID = socket.handshake.query.userID;

  if (userID) {
    const user = await getUser(userID);

    let friendIDs = user.friends
      ? Object.values(user.friends).map(function (item) {
          return item.toString();
        })
      : null;

    setUserStatus(user, friendIDs, true, userIo);

    socket.join(userID);
    // Client's own UserID is also returned by findById
    socket.on('activity:send', (packet) => onActivitySend(packet, friendIDs));

    socket.on('message:send', ({ toID, fromID, message }) => {
      userIo.to(toID).emit('message:receive', { fromID, message });
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

    socket.on('friendrequest:accept', (packet) => {
      const { toID } = packet;
      friendIDs.push(toID);
      userIo.in(toID).emit('user:online', user._id);

      // reset activity listener to include new friendIDs
      socket.removeAllListeners('activity:send');
      socket.on('activity:send', (packet) =>
        onActivitySend(packet, friendIDs.concat(toID))
      );
    });

    socket.on('friendrequest:cancel', (packet) => {
      const { toID } = packet;
      userIo.in(toID).emit('friendrequest:cancelreceive');
    });

    socket.on('disconnecting', (reason) => {
      setUserStatus(user, friendIDs, false, userIo);
      console.log('socket disconnecting: ', reason);
    });
    socket.on('disconnect', (reason) => {
      console.log('socket disconnected: ', reason);
    });

    userIo.on('disconnecting', (reason) => {
      setUserStatus(user, friendIDs, false, userIo);
      console.log('io disconnecting: ', reason);
    });
    userIo.on('disconnect', (reason) => {
      setUserStatus(user, friendIDs, false, userIo);

      console.log('io disconnected: ', reason);
    });
  } else console.error('No userID in handshake');
});
// =========socket end=========

process.on('unhandledRejection', (err, promise) => {
  console.log('Error: ', err);

  server.close(() => process.exit(1));
});
