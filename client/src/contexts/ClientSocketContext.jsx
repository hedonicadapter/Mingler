import { ipcRenderer } from 'electron';
import React, { useContext, useState, useEffect, createContext } from 'react';
import { io } from 'socket.io-client';

import DAO from '../config/DAO';
import { useAuth } from './AuthContext';
const { useLocalStorage } = require('../helpers/localStorageManager');

const ClientSocketContext = createContext();
export function useClientSocket() {
  return useContext(ClientSocketContext);
}

export function ClientSocketProvider({ children }) {
  const { currentUser } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    ipcRenderer.on('sendfriendrequest:frommain', ({ toID }) => {
      sendFriendRequest(toID);
    });
    ipcRenderer.on('cancelfriendrequest:frommain', ({ toID }) => {
      cancelFriendRequest(toID);
    });
  }, []);

  useEffect(() => {
    const newSocket = io('ws://127.0.0.1:8080/user', {
      auth: {
        token: 'test',
      },
      query: currentUser && {
        userID: currentUser._id?.replace(/['"]+/g, ''),
      },
    });
    setSocket(newSocket);

    return () => newSocket.close();
  }, [currentUser]);

  useEffect(() => {
    if (!socket) return;
    console.log('NEW SOCKET ALERT');
    socket.on('connect', () => {
      console.log('Client socket connected');
    });
    // User receives yt time request, and sends get request to ipcMain,
    // which forwards the request through the host to chromium to get the time
    // Packet contains url and tab title to find the right tab
    socket.on('youtubetimerequest:receive', (packet) => {
      ipcRenderer.send('getYouTubeTime', packet);
    });

    socket.io.on('error', (error) => {
      console.log(error);
    });
    socket.io.on('reconnect', (attempt) => {
      console.log(attempt);
    });

    return () => {
      socket.io.off('error');
      socket.io.off('reconnect');
      socket.off('youtubetimerequest:receive');
      socket.off('connect');
    };
  }, [socket]);

  // Deprecated I think lol
  const sendActivityToLocalStorage = (packet) => {
    // Each packet contains the ID it was sent from, and an activity wrapped in a data object
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

  const sendActivity = (data) => {
    const packet = { data, userID: currentUser._id };

    socket.emit('activity:send', packet);
  };

  const sendYouTubeTimeRequest = (toID, YouTubeTitle, YouTubeURL) => {
    const packet = { toID, YouTubeTitle, YouTubeURL };

    socket.emit('youtubetimerequest:send', packet);
  };

  const answerYouTubeTimeRequest = (toID, time) => {
    const packet = { toID, time };

    socket.emit('youtubetimerequest:answer', packet);
  };

  const sendFriendRequest = (toID) => {
    const packet = { toID, fromID: currentUser._id };

    socket.emit('friendrequest:send', packet);
  };

  const cancelFriendRequest = (toID) => {
    const packet = { toID, fromID: currentUser._id };

    socket.emit('friendrequest:cancel', packet);
  };

  const value = {
    sendActivity,
    sendFriendRequest,
    cancelFriendRequest,
    sendActivityToLocalStorage,
    sendYouTubeTimeRequest,
    answerYouTubeTimeRequest,
    socket,
  };

  return (
    <ClientSocketContext.Provider value={value}>
      {socket && children}
    </ClientSocketContext.Provider>
  );
}
