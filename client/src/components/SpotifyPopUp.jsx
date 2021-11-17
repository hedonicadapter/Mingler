import React, { useState, useEffect } from 'react';
import DAO from '../config/DAO';
import { spotifyApi } from '../config/spotify';
const electron = require('electron');
const BrowserWindow = electron.remote.BrowserWindow;

// TODO:
// use a proper redirect uri
export default function SpotifyPopUp(token) {
  const scopes = [
    'user-read-playback-state',
    'user-read-currently-playing',
    'user-read-playback-position',
  ];
  // authorize?client_id=5fe01282e44241328a84e7c5cc169165&response_type=code&redirect_uri=https://example.com/callback&scope=user-read-private%20user-read-email&state=some-state-of-my-choice
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
  console.log(authorizeURL);

  const injectScript = (win) => {
    win.webContents
      .executeJavaScript('window.location.href.toString()')
      .then((result) => {
        const code = result.substring(result.indexOf('=') + 1); // get only the string content after "="

        DAO.authorizeSpotify(code, token).then((result) => {
          console.log(result);
          localStorage.setItem(
            'access_token',
            result.data.body['access_token']
          );
          localStorage.setItem('expires_in', result.data.body['expires_in']);
          localStorage.setItem(
            'refresh_token',
            result.data.body['refresh_token']
          );
        });

        win.close();
      });
  };

  let win = new BrowserWindow({ show: false });
  win.on('close', function () {
    win = null;
  });
  win.loadURL(authorizeURL);
  win.once('ready-to-show', () => {
    win.show();

    injectScript(win);
    win.webContents.on('will-navigate', () => {
      win.webContents.once('dom-ready', () => {
        injectScript(win);
      });
    });
  });
}
