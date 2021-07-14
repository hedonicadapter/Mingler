import React, { useState, useEffect } from 'react';
const electron = require('electron');
const BrowserWindow = electron.remote.BrowserWindow;

// TODO:
// use a proper redirect uri
export default function SpotifyPopUp() {
  const CLIENT_ID = '5272130bae2b451e9a438f192f009112';
  const SPOTIFY_AUTHORIZE_ENDPOINT = 'https://accounts.spotify.com/authorize';
  const REDIRECT_URI = 'http://localhost:1212';
  const SPACE_DELIMITER = '%20';
  const SCOPES = [
    'user-read-playback-state',
    'user-read-currently-playing',
    'user-read-playback-position',
  ];
  const SCOPES_URL_PARAM = SCOPES.join(SPACE_DELIMITER);

  const AUTHORIZATION_URL =
    SPOTIFY_AUTHORIZE_ENDPOINT +
    '?client_id=' +
    CLIENT_ID +
    '&redirect_uri=' +
    REDIRECT_URI +
    '&scope=' +
    SCOPES_URL_PARAM +
    '&response_type=token&show_dialog=true';

  const getReturnedAuthParams = (hash) => {
    const stringAfterHashtag = hash.substring(1);
    const paramsInURL = stringAfterHashtag.split('&');

    const splitData = paramsInURL.reduce((accumulator, currentValue) => {
      const [key, value] = currentValue.split('=');
      accumulator[key] = value;
      return accumulator;
    }, {});

    return splitData;
  };

  let win = new BrowserWindow({ show: false });
  win.on('close', function () {
    win = null;
  });
  win.loadURL(AUTHORIZATION_URL);
  win.once('ready-to-show', () => {
    win.show();

    win.webContents.on('will-navigate', () => {
      win.webContents.once('dom-ready', () => {
        win.webContents
          .executeJavaScript('window.location.hash')
          .then((result) => {
            const { access_token, expires_in, refresh_token, code } =
              getReturnedAuthParams(result);

            localStorage.setItem('access_token', access_token);
            localStorage.setItem('expires_in', expires_in);
            localStorage.setItem('refresh_token', refresh_token);
            localStorage.setItem('code', code);

            win.close();
          });
      });
    });
  });
}
