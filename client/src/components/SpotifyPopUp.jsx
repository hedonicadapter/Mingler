import React, { useState, useEffect } from 'react';
import DAO from '../config/DAO';
import { spotifyApi } from '../config/spotify';
import { useStatus } from '../contexts/UserStatusContext';
const electron = require('electron');
const BrowserWindow = electron.remote.BrowserWindow;

// TODO:
// use a proper redirect uri
export default function SpotifyPopUp(token, setAccessToken, setRefreshToken) {
  let authorizeURL;

  DAO.createSpotifyURL(token).then((res) => {
    // authorize?client_id=5fe01282e44241328a84e7c5cc169165&response_type=code&redirect_uri=https://example.com/callback&scope=user-read-private%20user-read-email&state=some-state-of-my-choice

    let win = new BrowserWindow({ show: false });

    win.loadURL(res.data);

    win.once('ready-to-show', () => {
      win.show();

      win.webContents.on('will-redirect', (event, url) => {
        win.webContents.once('dom-ready', () => {
          injectScript(url).then(() => {
            win.close();
          });
        });
      });
    });

    win.on('close', function () {
      win = null;
    });
  });

  const injectScript = async (url) => {
    // get only the string content after "="
    const code = url.substring(url.indexOf('=') + 1);
    //localhost:1212/?code=AQC9QkkbHZT2A6sYJLo8Rd0taIkkbgRTReRx6Lw9QyiUwHykeCXdw55bEk6CBJjYS5sXDyzQPAjkt-QVzNcUzZDSzUeMqdfs2RKjyM9EnDKhI4dbnzk9cZMGSjeldKq_8B6eRRU2hD_imYqVIE-mGxYioZ9n_w_lzIzRJt4dXNpNyDiee9FZF9hxuq-kDSOX8QPVGqsmles7I9SSbQXtRg9R0LHSjS-wO62GA-mUZtAiefCsrINxDOjRaMyBJRZ31PeerArXZACX8tTSqQ

    DAO.authorizeSpotify(code, token).then((result) => {
      setAccessToken(result.data.body['access_token']);
      setRefreshToken(result.data.body['refresh_token']);
      localStorage.setItem('expires_in', result.data.body['expires_in']);
      return;
    });
  };
}
