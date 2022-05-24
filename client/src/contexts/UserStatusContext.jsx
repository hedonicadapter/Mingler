import React, { useState, useEffect, useContext, createContext } from 'react';
var path = require('path');
const execFile = require('child_process').execFile;

import { getAccessToken, refreshAccessToken } from '../config/spotify';
import DAO from '../config/DAO';
import { useLocalStorage } from '../helpers/localStorageManager';
import { useClientSocket } from './ClientSocketContext';
import { useDispatch, useSelector } from 'react-redux';
import {
  getCurrentUser,
  setAccessTokenMain,
} from '../mainState/features/settingsSlice';

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
  const currentUser = useSelector((state) => getCurrentUser(state));
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
    var exePath = path.resolve(__dirname, '../scripts/ActiveWindowListener.py');
    process = execFile('python', [exePath]);

    process.stdout.on('data', function (data) {
      if (!currentUser) return;

      let activeWindow = data.toString().trim();

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
  const activeTrackListener = () => {
    trackProcess?.kill();

    if (currentUser?.accessToken) {
      var exePath = path.resolve(
        __dirname,
        '../scripts/ActiveTrackListener.py'
      );

      trackProcess = execFile('python', [exePath, currentUser?.accessToken]);

      trackProcess.stdout.on('data', function (data) {
        if (data === '401' && refreshRetryLimit < 2) {
          refreshSpotify();
          refreshRetryLimit++;
          return;
        }

        let processedData = data.toString().trim();

        let trackInfo = JSON.parse(processedData.replaceAll("'", '"'));

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
      });

      trackProcess.stderr.on('data', function (data) {
        console.log('stderr activeTrackListener', data);
      });

      trackProcess.on('error', function (err) {
        if (err) return console.error(err);
      });
    }
  };

  const refreshSpotify = () => {
    DAO.refreshSpotify(currentUser?.refreshToken, currentUser?.accessToken)
      .then((result) => {
        console.log('DAO REFRESHSPOTIFY LALALA ');
        dispatch(setAccessTokenMain(result.data.body.access_token));
      })
      .catch((e) => {
        console.log('Refreshing spotify auth error ', e);
      });
  };

  const exitListeners = () => {
    process.kill();
  };

  useEffect(() => {
    if (currentUser?.accessToken) {
      activeTrackListener();

      if (currentUser?.refreshToken) {
        refreshSpotify();
      }
    }
  }, [currentUser]);

  useEffect(() => {}, [currentUser]);

  useEffect(() => {
    activeWindowListener();
    // return exitListeners();
  }, []);

  const value = {};

  return (
    <UserStatusContext.Provider value={value}>
      {children}
    </UserStatusContext.Provider>
  );
}
