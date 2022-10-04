import { ipcRenderer } from 'electron';
import React, { useContext, useState, useEffect, createContext } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { notify } from '../components/reusables/notifications';

import DAO from '../config/DAO';
import { getCurrentUser } from '../mainState/features/settingsSlice';
const { useLocalStorage } = require('../helpers/localStorageManager');

const baseURL = 'ws://127.0.0.1:8080/user';
// const baseURL = 'https://menglir.herokuapp.com/user';

const socket = io(baseURL, {
  auth: { accessToken: '', userID: '' },
});

const ClientSocketContext = createContext();
export function useClientSocket() {
  return useContext(ClientSocketContext);
}

export function ClientSocketProvider({ children }) {
  const currentUser = useSelector((state) => getCurrentUser(state));
  // const [socket, setSocket] = useState(null);

  // const connectSocket = (user) => {
  //   const newSocket = io(baseURL, {
  //     auth: {
  //       accessToken: user && user.accessToken,
  //     },
  //     query: user && {
  //       userID: user._id?.replace(/['"]+/g, ''),
  //     },
  //   });
  //   setSocket(newSocket);
  // };

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
  }, []);

  useEffect(() => {
    if (!currentUser?._id || !currentUser?.accessToken) return;

    socket.auth.userID = currentUser?._id?.replace(/['"]+/g, '');
    socket.auth.accessToken = currentUser?.accessToken;
    socket?.disconnect()?.connect();
  }, [currentUser?._id, currentUser?.accessToken]);

  useEffect(() => {
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

    return () => {
      socket?.disconnect();
      socket?.io.off('error');
      socket?.io.off('reconnect');
      socket?.off('connect');
      socket?.removeAllListeners();
      socket?.close();
    };
  }, []);

  const sendFriendRequestFromMainHandler = (evt, toID) => {
    const packet = { toID, fromID: currentUser._id };

    socket.emit('friendrequest:send', packet);
  };

  const cancelFriendRequestFromMainHandler = (evt, toID) => {
    const packet = { toID, fromID: currentUser._id };

    socket.emit('friendrequest:cancel', packet);
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
    acceptFriendRequest,
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
