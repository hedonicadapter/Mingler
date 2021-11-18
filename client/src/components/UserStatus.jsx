import React, { useState, useEffect } from 'react';
var path = require('path');
const execFile = require('child_process').execFile;

import { useAuth } from '../contexts/AuthContext';

import { db } from '../config/firebase';
import { getAccessToken, refreshAccessToken } from '../config/spotify';
import DAO from '../config/DAO';
import { useLocalStorage } from '../helpers/localStorageManager';
const socket = require('../config/socket');

const { ipcRenderer } = require('electron');

// Starts the script (../scripts/ActiveWindowListener.py) that listens for the user's
// foreground window and returns it here.
//
// The youtube and chromium listeners are handled by the dedicated chromium extension.
export default function UserStatus() {
  const { currentUser, token } = useAuth();
  const [accessToken, setAccessToken] = useLocalStorage('access_token');
  const [refreshToken, setRefreshToken] = useLocalStorage('refresh_token');

  ipcRenderer.on('chromiumHostData', function (event, data) {
    socket.sendActivity(
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
    // socket.sendActivityToLocalStorage({
    //   userID: currentUser._id,
    //   data: {
    //     TabTitle: data?.TabTitle,
    //     TabURL: data?.TabURL,
    //     YouTubeTitle: data?.YouTubeTitle,
    //     YouTubeURL: data?.YouTubeURL,
    //     Date: new Date(),
    //   },
    // });
  });

  const activeWindowListener = () => {
    let process;
    var exePath = path.resolve(__dirname, '../scripts/ActiveWindowListener.py');
    process = execFile('python', [exePath]);

    process.stdout.on('data', function (data) {
      let activeWindow = data.toString().trim();

      // Second comparison doesn't work for some reason
      if (
        activeWindow &&
        activeWindow !== 'Sharehub' &&
        activeWindow !== 'Task Switching' &&
        activeWindow !== 'Snap Assist' &&
        activeWindow !== 'Spotify Free'
      ) {
        socket.sendActivity(
          { WindowTitle: activeWindow, Date: new Date() },
          currentUser._id
        );
        // socket.sendActivityToLocalStorage({
        //   userID: currentUser._id,
        //   data: { WindowTitle: activeWindow, Date: new Date() },
        // });
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
  const activeTrackListener = () => {
    trackProcess?.kill();

    if (accessToken) {
      var exePath = path.resolve(
        __dirname,
        '../scripts/ActiveTrackListener.py'
      );

      trackProcess = execFile('python', [exePath, accessToken]);

      trackProcess.stdout.on('data', function (data) {
        let trackInfo = JSON.parse(data.toString().trim().replaceAll("'", '"'));

        if (trackInfo) {
          socket.sendActivity(
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
        console.log('stderr activeTrackListener');
        if (data) refreshSpotify();
      });

      trackProcess.on('error', function (err) {
        if (err) return console.error(err);
      });
    }
  };

  const refreshSpotify = () => {
    DAO.refreshSpotify(refreshToken, token)
      .then((result) => {
        console.log('refresh ', result);
        setAccessToken(result.data.body.access_token);
      })
      .catch((e) => {
        console.log('Refreshing spotify auth error ', e);
      });
  };

  const exitListeners = () => {
    process.kill();
  };

  useEffect(() => {
    activeTrackListener();
  }, [accessToken]);

  useEffect(() => {
    if (refreshToken && token) {
      refreshSpotify();
    }
  }, [refreshToken, token]);

  useEffect(() => {
    activeWindowListener();
    // return exitListeners();
  }, []);
}
