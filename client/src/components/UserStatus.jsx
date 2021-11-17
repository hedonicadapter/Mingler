import React, { useState, useEffect } from 'react';
var path = require('path');
const execFile = require('child_process').execFile;

import { useAuth } from '../contexts/AuthContext';

import { db } from '../config/firebase';
import { getAccessToken, refreshAccessToken } from '../config/spotify';
const socket = require('../config/socket');

const { ipcRenderer } = require('electron');

// Starts the script (../scripts/ActiveWindowListener.py) that listens for the user's
// foreground window and returns it here.
//
// The youtube and chromium listeners are handled by the dedicated chromium extension.
export default function UserStatus() {
  const { currentUser } = useAuth();

  let currentListener;

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

  const activeTrackListener = () => {
    let process;

    const access_token = localStorage.getItem('access_token');

    if (access_token) {
      var exePath = path.resolve(
        __dirname,
        '../scripts/ActiveTrackListener.py'
      );

      process = execFile('python', [exePath, access_token]);

      process.stdout.on('data', function (data) {
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

      process.stderr.on('data', function (data) {
        console.log('stderr activeTrackListener');
        if (data) refreshToken();
      });

      process.on('error', function (err) {
        if (err) return console.error(err);
      });

      window.onstorage = () => {
        // kill spotify script process,
        // recreate process with now updated variables
        console.log('stored stuff');
        process.kill();
        activeTrackListener();
      };
    }
  };

  const refreshToken = () => {
    // refreshAccessToken();
  };

  const exitListeners = () => {
    process.kill();
    currentListener(); // for firestore onSnapshot listeners
  };

  useEffect(() => {
    activeWindowListener();
    activeTrackListener();
    // return exitListeners();
  }, []);
}
