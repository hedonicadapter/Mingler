import { ipcRenderer } from 'electron';
import React, { useContext, useState, useEffect, createContext } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';

import DAO from '../config/DAO';
import { getCurrentUser } from '../mainState/features/settingsSlice';
const { useLocalStorage } = require('../helpers/localStorageManager');

const ClientSocketContext = createContext();
export function useClientSocket() {
  return useContext(ClientSocketContext);
}

export function ClientSocketProvider({ children }) {
  const currentUser = useSelector((state) => getCurrentUser(state));
  const [socket, setSocket] = useState(null);

  const connectSocket = () => {
    // ws://127.0.0.1:8080/user
    const newSocket = io('https://menglir.herokuapp.com/user', {
      auth: {
        accessToken: currentUser && currentUser.accessToken,
      },
      query: currentUser && {
        userID: currentUser._id?.replace(/['"]+/g, ''),
      },
    });
    setSocket(newSocket);
  };

  useEffect(() => {
    ipcRenderer.on(
      'sendfriendrequest:frommain',
      sendFriendRequestFromMainHandler
    );
    ipcRenderer.on(
      'cancelfriendrequest:frommain',
      cancelFriendRequestFromMainHandler
    );

    return () => {
      ipcRenderer.removeAllListeners(
        'sendfriendrequest:frommain',
        sendFriendRequestFromMainHandler
      );
      ipcRenderer.removeAllListeners(
        'cancelfriendrequest:frommain',
        cancelFriendRequestFromMainHandler
      );
    };
  }, [socket]);

  useEffect(() => {
    connectSocket();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('connect', () => {
        console.log('Client socket connected');
      });

      socket.io.on('error', (error) => {
        console.log(error);
      });
      socket.io.on('reconnect', (attempt) => {
        console.log(attempt);
      });

      socket.on('disconnect', (reason) => {
        console.log('disconnected ', reason);
      });

      socket.on('connect_error', () => {
        console.log('connect_error');
      });
    }

    return () => {
      socket?.disconnect();
      socket?.io.off('error');
      socket?.io.off('reconnect');
      socket?.off('connect');
      socket?.removeAllListeners();
      socket?.close();
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

  const sendFriendRequestFromMainHandler = (evt, toID) => {
    const packet = { toID, fromID: currentUser._id };

    socket.emit('friendrequest:send', packet);
  };

  const cancelFriendRequestFromMainHandler = (evt, toID) => {
    const packet = { toID, fromID: currentUser._id };

    socket.emit('friendrequest:cancel', packet);
  };

  const sendActivity = (data, userID) => {
    const packet = { data, userID };

    socket.emit('activity:send', packet);
  };

  const sendYouTubeTimeRequest = (toID, YouTubeTitle, YouTubeURL) => {
    const packet = { toID, fromID: currentUser?._id, YouTubeTitle, YouTubeURL };

    socket.emit('youtubetimerequest:send', packet);
  };

  const answerYouTubeTimeRequest = (fromID, time) => {
    const packet = { fromID, time };

    socket.emit('youtubetimerequest:answer', packet);
  };

  // const sendFriendRequest = (toID) => {
  //   const packet = { toID, fromID: currentUser._id };

  //   socket.emit('friendrequest:send', packet);
  // };

  const acceptFriendRequest = (toID) => {
    const packet = { toID, fromID: currentUser._id };

    socket.emit('friendrequest:accept', packet);
  };

  // const cancelFriendRequest = (toID) => {
  //   const packet = { toID, fromID: currentUser._id };

  //   socket.emit('friendrequest:cancel', packet);
  // };

  const value = {
    sendActivity,
    acceptFriendRequest,
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
