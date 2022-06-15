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

const JSON5 = require('json5');

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

  ipcRenderer.on('chromiumHostData', function (event, data) {
    sendActivity(
      {
        //Either tabdata or youtube data is sent, never both
        TabTitle: data?.TabTitle,
        TabURL: data?.TabURL,
        YouTubeTitle: data?.YouTubeTitle,
        YouTubeURL: data?.YouTubeURL,
        Date: new Date(),
      },
      currentUser._id
    );
  });

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
        activeWindow !== 'Sharehub' &&
        activeWindow !== 'Task Switching' &&
        activeWindow !== 'Snap Assist' &&
        activeWindow !== 'Spotify Free'
      ) {
        sendActivity(
          { WindowTitle: activeWindow, Date: new Date() },
          currentUser._id
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

  let trackProcess;
  let refreshRetryLimit = 0;
  const activeTrackListener = (spotifyAccessToken) => {
    console.log('before close ', trackProcess);
    trackProcess?.close();

    if (!spotifyAccessToken) return;

    let exePath = path.resolve(__dirname, '../scripts/ActiveTrackListener.py');

    trackProcess = execFile('python', [exePath, spotifyAccessToken]);

    trackProcess.on('exit', () =>
      console.warn('trackprocess exited ', trackProcess)
    );

    trackProcess.stdout.on('data', function (data) {
      let processedData = data.toString().trim();
      if (processedData === '401') {
        trackProcess.stdin.end();
        trackProcess.stdout.destroy();
        trackProcess.stderr.destroy();
        try {
          trackProcess?.close();
        } catch (e) {
          console.log(e);
        }
        return;
      }

      try {
        console.log('processedData1', processedData);
        let trackInfo = JSON5.parse(processedData);

        console.log('trackinfo3 ', trackInfo);

        if (trackInfo) {
          sendActivity(
            {
              Artists: trackInfo.artists,
              TrackTitle: trackInfo.name,
              TrackURL: trackInfo.link,
              Date: new Date(),
            },
            currentUser._id
          );
        }
      } catch (e) {
        console.error(e);
      }
    });

    trackProcess.stderr.on('data', function (data) {
      console.warn('stderr activeTrackListener: ', data);
    });

    trackProcess.on('error', function (err) {
      if (err) return console.error('trackprocess error: ', err);
    });
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

  const exitListeners = () => {
    trackProcess?.close();
    process.exit();
  };

  useEffect(() => {
    if (!currentUser?.spotifyExpiryDate) return;

    let now = new Date();
    let spotifyExpiryDate = new Date(currentUser?.spotifyExpiryDate);
    let timeout = spotifyExpiryDate - now;

    setTimeout(
      () => {
        refreshSpotify();
      },
      spotifyExpiryDate > now ? timeout : 0
    );

    console.log(
      'set spotify refresh timeout for ',
      spotifyExpiryDate > now ? Math.floor(timeout / 60000) : 0,
      ' minutes.'
    );
  }, [currentUser?.spotifyExpiryDate]);

  useEffect(() => {
    activeWindowListener();
    activeTrackListener(currentUser?.spotifyAccessToken);
    // return () => exitListeners();
  }, []);

  const value = { activeTrackListener };

  return (
    <UserStatusContext.Provider value={value}>
      {children}
    </UserStatusContext.Provider>
  );
}
