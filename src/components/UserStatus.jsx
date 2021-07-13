import React, { useState, useEffect } from 'react';

import { useAuth } from '../contexts/AuthContext';

import { db } from '../config/firebase';

// Starts the script (../scripts/ActiveWindowListener.py) that listens for the user's
// foreground window and returns it here.
//
// The youtube and chromium listeners are handled by the dedicated chromium extension.
export default function UserStatus() {
  const { currentUser } = useAuth();

  let process;
  let currentListener;

  const handleLinkClick = (url) => {
    const shell = require('electron').shell;
    shell.openExternal(url);
  };

  const activeWindowListener = () => {
    var path = require('path');
    const execFile = require('child_process').execFile;

    var exePath = path.resolve(__dirname, '../scripts/ActiveWindowListener.py');
    process = execFile('python', [exePath]);

    process.stdout.on('data', function (data) {
      let activeWindow = data.toString().trim();

      // Second comparison doesn't work for some reason
      if (activeWindow !== 'Sharehub' && activeWindow !== 'Task Switching') {
        db.collection('Users')
          .doc(currentUser.uid)
          .collection('Activity')
          .doc('ActiveWindow')
          .set({ WindowTitle: activeWindow, Date: new Date() });
      }
    });

    process.on('error', function (err) {
      if (err) return console.error(err);
    });
  };

  const activeSongListener = () => {
    // spotifyApi.getMyCurrentPlayingTrack().then(
    //   function (data) {
    //     console.log('Now playing: ' + data.body.item.name);
    //   },
    //   function (err) {
    //     console.log('Something went wrong!', err);
    //   }
    // );
  };

  const exitListeners = () => {
    process.kill();
    currentListener(); // for firestore onSnapshot listeners
  };

  useEffect(() => {
    activeWindowListener();
    activeSongListener();
    // return exitListeners();
  }, []);
}
