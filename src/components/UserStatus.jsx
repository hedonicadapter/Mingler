import React, { useState, useEffect } from 'react';
var path = require('path');
const execFile = require('child_process').execFile;

import { useAuth } from '../contexts/AuthContext';

import { db } from '../config/firebase';

// Starts the script (../scripts/ActiveWindowListener.py) that listens for the user's
// foreground window and returns it here.
//
// The youtube and chromium listeners are handled by the dedicated chromium extension.
export default function UserStatus() {
  const { currentUser } = useAuth();

  let currentListener;

  const activeWindowListener = () => {
    let process;
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

    process.stderr.on('data', function (data) {
      console.log('stderr windowListener');
      if (data) return console.log(data);
    });

    process.on('error', function (err) {
      if (err) return console.error(err);
    });
  };

  const activeTrackListener = () => {
    let process;

    const access_token = localStorage.getItem('access_token');
    const expires_in = localStorage.getItem('expires_in');
    const token_type = localStorage.getItem('token_type');

    if ((access_token, expires_in)) {
      var exePath = path.resolve(
        __dirname,
        '../scripts/ActiveTrackListener.py'
      );
      process = execFile('python', [exePath, access_token]);
      console.log(process);

      process.stdout.on('data', function (data) {
        console.log(data);
        let activeTrack = data.toString().trim();

        // Second comparison doesn't work for some reason
        if (activeTrack) {
          db.collection('Users')
            .doc(currentUser.uid)
            .collection('Activity')
            .doc('ActiveTrack')
            .set({ TrackTitle: activeTrack, Date: new Date() });
        }
      });

      process.stderr.on('data', function (data) {
        console.log('stderr activeTrackListener');
        if (data) return console.log(data);
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
