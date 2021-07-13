import React, { useState, useEffect } from 'react';
const electron = require('electron');
const BrowserWindow = electron.remote.BrowserWindow;

export default function spotifyPopUp() {
  const CLIENT_ID = '5272130bae2b451e9a438f192f009112';
  const SPOTIFY_AUTHORIZE_ENDPOINT = 'https://accounts.spotify.com/authorize';
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
    '&scope=' +
    SCOPES_URL_PARAM +
    '&response_type=token&show_dialog=true';

  let win = new BrowserWindow({ show: false });
  win.on('close', function () {
    win = null;
  });
  win.loadURL(AUTHORIZATION_URL);
  win.once('ready-to-show', () => {
    win.show();
  });
}
