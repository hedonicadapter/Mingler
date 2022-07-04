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

  const activeWindowListener = () => {
    let process;
    let exePath = path.resolve(__dirname, '../scripts/ActiveWindowListener.py');
    process = execFile('python', [exePath]);

    process.stdout.on('data', function (data) {
      if (!currentUser) return;

      let activeWindow = data.toString().trim();

      console.log('activeWindow ', activeWindow);

      // Second comparison doesn't work for some reason
      if (
        activeWindow &&
        activeWindow !== 'Mingler' &&
        activeWindow !== 'Task Switching' &&
        activeWindow !== 'Snap Assist' &&
        activeWindow !== 'Spotify Free'
      ) {
        sendActivity(
          { WindowTitle: activeWindow, Date: new Date() },
          currentUser?._id
        );
      }
    });

    // process.stderr.on('data', function (data) {
    // if (data) console.log('STDERR: ', data);
    // });

    process.on('error', function (err) {
      if (err) return console.error(err);
    });
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
    console.log('no result');
    return notify('Error', 'Failed to initialize Spotify.');
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

  const trackInfoFromMainHandler = (evt, trackInfo) => {
    sendActivity(trackInfo, currentUser?._id);
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
    };
  }, []);

  const value = { activeTrackListener };

  return (
    <UserStatusContext.Provider value={value}>
      {children}
    </UserStatusContext.Provider>
  );
}
