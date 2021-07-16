import React, { useState, useEffect } from 'react';
import { spotifyApi } from '../config/spotify';
const electron = require('electron');
const BrowserWindow = electron.remote.BrowserWindow;

// TODO:
// use a proper redirect uri
export default function SpotifyPopUp() {
  const scopes = [
    'user-read-playback-state',
    'user-read-currently-playing',
    'user-read-playback-position',
  ];
  // authorize?client_id=5fe01282e44241328a84e7c5cc169165&response_type=code&redirect_uri=https://example.com/callback&scope=user-read-private%20user-read-email&state=some-state-of-my-choice
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
  console.log(authorizeURL);

  const getReturnedAuthParams = (hash) => {
    return hash.replaceFirst(/.*(?=http:\/\/localhost:1212\/?code=)/);
    // const stringAfterHashtag = hash.substring(1);
    // const paramsInURL = stringAfterHashtag.split('&');
    // const splitData = paramsInURL.reduce((accumulator, currentValue) => {
    //   const [key, value] = currentValue.split('=');
    //   accumulator[key] = value;
    //   return accumulator;
    // }, {});
    // return splitData;
  };

  const injectScript = (win) => {
    win.webContents
      .executeJavaScript('window.location.href.toString()')
      .then((result) => {
        const code = result.substring(result.indexOf('=') + 1); // get only the string content after "="

        spotifyApi.authorizationCodeGrant(code).then(
          function (data) {
            localStorage.setItem('access_token', data.body['access_token']);
            localStorage.setItem('expires_in', data.body['expires_in']);
            localStorage.setItem('refresh_token', data.body['refresh_token']);

            // Set the access token on the API object to use it in later calls
            spotifyApi.setAccessToken(data.body['access_token']);
            spotifyApi.setRefreshToken(data.body['refresh_token']);
          },
          function (e) {
            console.log('Spotify authorization code grant error: ', e);
          }
        );

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
