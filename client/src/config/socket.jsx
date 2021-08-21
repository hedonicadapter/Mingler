import { io } from 'socket.io-client';

const userID = localStorage.getItem('userID');

const socket = io('ws://127.0.0.1:8080/user', {
  auth: {
    token: 'test',
  },
  query: {
    userID: JSON.parse(userID),
  },
});

socket.on('connect', () => {
  console.log('Client socket connected');

  socket.on('activity:receive', (msg) => {
    console.log('working pog');
  });
});

socket.io.on('error', (error) => {
  console.log(error);
});
socket.io.on('reconnect', (attempt) => {
  console.log(attempt);
});

const sendActivity = () => {
  console.log('sendactivity');
  socket.emit('activity:send', 'activity sent');
};

export { sendActivity };
