import React, { useState, useEffect, useContext, createContext } from 'react';
var path = require('path');
const execFile = require('child_process').execFile;

import DAO from '../config/DAO';
import { useLocalStorage } from '../helpers/localStorageManager';
import { useClientSocket } from './ClientSocketContext';
import { useDispatch, useSelector } from 'react-redux';
import {
  getCurrentUser,
  setAccessTokenMain,
  setSpotifyAccessTokenMain,
  setSpotifyExpiryDate,
  setSpotifyRefreshTokenMain,
} from '../mainState/features/settingsSlice';
import { notify } from '../components/reusables/notifications';

const { ipcRenderer } = require('electron');

const UserStatusContext = createContext();

export function useStatus() {
  return useContext(UserStatusContext);
}

// Starts the script (../scripts/ActiveWindowListener.py) that listens for the user's
// foreground window and returns it here.
//
// The youtube and chromium listeners are handled by the dedicated chromium extension.
export function UserStatusProvider({ children }) {
  const currentUser = useSelector(getCurrentUser);
  const dispatch = useDispatch();

  const { sendActivity } = useClientSocket();

  const activeWindowListener = async () => {
    ipcRenderer.removeAllListeners(
      'windowinfo:frommain',
      windowInfoFromMainHandler
    );
    const result = await ipcRenderer.invoke(
      'initActiveWindowListener:fromrenderer'
    );

    if (result)
      return ipcRenderer.on('windowinfo:frommain', windowInfoFromMainHandler);
    return notify('Error', 'Failed to initialize window listener.');
  };

  const activeTrackListener = async (spotifyAccessToken) => {
    ipcRenderer.removeAllListeners(
      'trackinfo:frommain',
      trackInfoFromMainHandler
    );
    const result = await ipcRenderer.invoke(
      'initActiveTrackListener:fromrenderer',
      spotifyAccessToken
    );

    if (result)
      return ipcRenderer.on('trackinfo:frommain', trackInfoFromMainHandler);
    return notify('Error', 'Failed to initialize Spotify.');
  };

  const windowInfoFromMainHandler = (evt, windowInfo) => {
    sendActivity(windowInfo, currentUser?._id);
  };

  const trackInfoFromMainHandler = (evt, trackInfo) => {
    sendActivity(trackInfo, currentUser?._id);
  };

  const refreshSpotify = () => {
    DAO.refreshSpotify(
      currentUser?.spotifyRefreshToken,
      currentUser._id,
      currentUser?.accessToken
    )
      .then((result) => {
        if (!result.data) return;

        dispatch(setSpotifyAccessTokenMain(result.data.body.access_token));
        dispatch(setSpotifyExpiryDate(result.data.body.spotifyExpiryDate));
        activeTrackListener(result.data.body.access_token);
      })
      .catch((e) => {
        console.log('Refreshing spotify error ', e);
      });
  };

  const chromiumHostDataHandler = (event, data) => {
    sendActivity(
      {
        //Either tabdata or youtube data is sent, never both
        TabTitle: data?.TabTitle,
        TabURL: data?.TabURL,
        YouTubeTitle: data?.YouTubeTitle,
        YouTubeURL: data?.YouTubeURL,
        Date: new Date(),
      },
      currentUser?._id
    );
  };

  useEffect(() => {
    if (!currentUser?.spotifyExpiryDate) return;

    let now = new Date();
    let spotifyExpiryDate = new Date(currentUser?.spotifyExpiryDate);
    let time = spotifyExpiryDate - now;

    const refreshTimeout = setTimeout(
      () => {
        refreshSpotify();
      },
      spotifyExpiryDate > now ? time : 0
    );

    // console.log(
    //   'set spotify refresh timeout for ',
    //   spotifyExpiryDate > now ? Math.floor(time / 60000) : 0,
    //   ' minutes.'
    // );

    return () => clearTimeout(refreshTimeout);
  }, [currentUser?.spotifyExpiryDate]);

  useEffect(() => {
    ipcRenderer.on('chromiumHostData', chromiumHostDataHandler);

    activeWindowListener();
    activeTrackListener(currentUser?.spotifyAccessToken);

    return () => {
      ipcRenderer.removeAllListeners(
        'chromiumHostData',
        chromiumHostDataHandler
      );
      ipcRenderer.removeAllListeners(
        'trackinfo:frommain',
        trackInfoFromMainHandler
      );
      ipcRenderer.removeAllListeners(
        'windowinfo:frommain',
        windowInfoFromMainHandler
      );
    };
  }, []);

  const value = { activeTrackListener };

  return (
    <UserStatusContext.Provider value={value}>
      {children}
    </UserStatusContext.Provider>
  );
}
