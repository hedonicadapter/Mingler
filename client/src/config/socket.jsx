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

const sendActivityToLocalStorage = (packet) => {
  // Each packet contains the ID it was sent from
  const userID = packet?.userID;

  // activities are organized by userID so we can easily get them for each friend
  const latestActivity = localStorage.getItem(userID);
  if (latestActivity) {
    let latestActivityParsed = JSON.parse(latestActivity);
    // Put this activity on the top
    latestActivityParsed.unshift(packet.data);

    localStorage.setItem(userID, JSON.stringify(latestActivityParsed));

    // Clear storage if a user has more than 5 saved activitiees
    if (latestActivityParsed.length > 5) {
      cleanUpLocalStorageActivities(userID, latestActivityParsed);
    }
  } else {
    const data = [packet.data];
    localStorage.setItem(packet.userID, JSON.stringify(data));
  }
};

// Removes the oldest activity from a given user's activities array
const cleanUpLocalStorageActivities = (userID, latestActivityParsed) => {
  latestActivityParsed.pop();
  localStorage.setItem(userID, JSON.stringify(latestActivityParsed));
};

socket.on('connect', () => {
  console.log('Client socket connected');

  socket.on('activity:receive', (packet) => {
    sendActivityToLocalStorage(packet);
  });

  socket.on('friendrequest:receive', () => {
    console.log('friend request received');
  });
});

socket.io.on('error', (error) => {
  console.log(error);
});
socket.io.on('reconnect', (attempt) => {
  console.log(attempt);
});

const sendActivity = (data, userID) => {
  const packet = { data, userID };

  socket.emit('activity:send', packet);
};

const sendFriendRequest = (toID, fromID) => {
  const packet = { toID, fromID };

  socket.emit('friendrequest:send', packet);
};

export { sendActivity, sendFriendRequest };
