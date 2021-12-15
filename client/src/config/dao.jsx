import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { app } from './realmDB';
import { ipcRenderer } from 'electron';

const auth = axios.create({
  baseURL: 'http://localhost:8080/api/auth/',
  headers: {
    'Content-type': 'application/json',
  },
});

export const privateRoute = axios.create({
  baseURL: 'http://localhost:8080/api/private/',
  withCredentials: true,
  headers: {
    'Content-type': 'application/json',
  },
});

export const token = axios.create({
  baseURL: 'http://localhost:8080/api/token/',
  withCredentials: true,
  headers: {
    'Content-type': 'application/json',
  },
});

function getOldRefreshToken(oldToken) {
  return localStorage.getItem(oldToken);
}

class DAO {
  signUpWithEmail = (name, email, password, clientFingerprint) => {
    const data = { name, email, password, clientFingerprint };

    return auth.post('/signUpWithEmail', data);
  };

  signUpGuest = (username, clientFingerprint) => {
    const data = { username, clientFingerprint };

    return auth.post('/signUpGuest', data);
  };

  signInGuest = (guestID, clientFingerprint) => {
    const data = { guestID, clientFingerprint };

    return auth.post('/signInGuest', data);
  };

  signIn = (email, password, clientFingerprint) => {
    const data = { email, password, clientFingerprint };

    return auth.post('/signIn', data);
  };

  logout = () => {
    return;
  };

  findUserByEmail = (email) => {
    return auth.get(`/findUser?email=${email}`);
  };

  getFriends = (userID, token) => {
    const data = { userID };

    return privateRoute.post(`/getFriends`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  searchUsers = (searchTerm, token) => {
    console.log('TOKEN DAO ', token);
    const data = { searchTerm };

    return privateRoute.post('/searchUsers', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  sendFriendRequest = (toID, fromID, token) => {
    const data = { toID, fromID };

    return privateRoute.post('/sendFriendRequest', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  acceptFriendRequest = (fromID, userID, token) => {
    const data = { fromID, userID };

    return privateRoute.post('/acceptFriendRequest', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  cancelFriendRequest = (toID, fromID, token) => {
    const data = { toID, fromID };

    return privateRoute.post('/cancelFriendRequest', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  getFriendRequests = (userID, token) => {
    const data = { userID };

    return privateRoute.post('/getFriendRequests', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  getSentFriendRequests = (userID, token) => {
    const data = { userID };

    return privateRoute.post('/getSentFriendRequests', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  sendMessage = (toID, fromID, message, token) => {
    const data = { toID, fromID, message };

    return privateRoute.post('/sendMessage', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  createSpotifyURL = (token) => {
    return privateRoute.post('/createSpotifyURL', null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  authorizeSpotify = (code, token) => {
    const data = { code };

    return privateRoute.post('/authorizeSpotify', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  refreshSpotify = (refreshToken, token) => {
    const data = {
      refreshToken,
    };

    return privateRoute.post('/refreshSpotify', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  saveMessengerCredentials = (token, appState) => {
    const data = {
      appState,
    };

    return privateRoute.post('/saveMessengerCredentials', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };
}

const getNewToken = async (refreshToken) => {
  const data = { refreshToken };

  return token.post('/refreshToken', data);
};

privateRoute.interceptors.response.use(
  function (response) {
    return response;
  },
  async function (error) {
    const ogRequest = error.config;
    if (401 === error.response.status && !ogRequest.retry) {
      const oldAccessToken = ogRequest.headers.Authorization.replace(
        /^Bearer\s+/,
        ''
      );

      const refreshToken = localStorage.getItem(oldAccessToken);

      // PRINTING THE SAME TOKEN OVER AND OVER
      if (!refreshToken) return Promise.reject('409: No refresh token found.');

      const og = await getNewToken(refreshToken)
        .then((tokens) => {
          const access = tokens.data.token;
          const refresh = tokens.data.refreshToken;

          if (access && refresh) {
            localStorage.removeItem(oldAccessToken);
            localStorage.setItem(access, refresh);

            const { port1 } = new MessageChannel();
            ipcRenderer.postMessage(
              'refreshtoken:fromrenderer',
              { access, refresh },
              [port1]
            );

            ogRequest.headers.Authorization = 'Bearer ' + access;
            ogRequest.retry = true;

            return ogRequest;
          }
        })
        .catch((e) => {
          return Promise.reject(e);
        });

      if (og) {
        axios(og);
      } else return Promise.reject('No token returned.');
    } else {
      return Promise.reject(error);
    }
  }
);

export default new DAO();

// Get friends' IDs of current user by current user's ID

// Get activities of each friend by their IDs ordered by date
// Set name of current user

// Set active window

// Set active track

// TODO:
// OnlineFriends and stuff
// Search
