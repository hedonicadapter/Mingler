require('dotenv').config({ path: './config.env' });
const express = require('express');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

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

io.on('connection', (socket) => {
  console.log('io connected: ', socket.id);
  io.emit('big', 'yo');

  io.on('disconnect', (reason) => {
    console.log('io disconnected: ', reason);
  });
});
// =========socket end=========

process.on('unhandledRejection', (err, promise) => {
  console.log('Error: ', err);

  server.close(() => process.exit(1));
});
