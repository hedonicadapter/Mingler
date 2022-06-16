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

export class DAO {
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

  signInRememberedUser = (refreshToken) => {
    const data = { refreshToken };

    return auth.post('/signInRememberedUser', data);
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

  getConversations = (userID, token) => {
    const data = { userID };

    return privateRoute.post(`/getConversations`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  searchUsers = (searchTerm, token) => {
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

  getMessages = (conversationID, skip, token) => {
    const data = { conversationID, skip };

    return privateRoute.post('/getMessages', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  sendMessage = (toID, fromID, message, sentDate, token) => {
    const data = { toID, fromID, message, sentDate };

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

  authorizeSpotify = (code, userID, token) => {
    const data = { code, userID, currentClientTime: new Date() };

    return privateRoute.post('/authorizeSpotify', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  refreshSpotify = (refreshToken, userID, token) => {
    const data = {
      refreshToken,
      userID,
      currentClientTime: new Date(),
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
const getNewToken = (refreshToken) => {
  const data = { refreshToken };

  return token.post('/refreshToken', data);
};

privateRoute.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    const ogRequest = error.config;
    if (401 === error.response.status && !ogRequest.retry) {
      console.log('retrying spotify ');
      const oldAccessToken = ogRequest.headers.Authorization.replace(
        /^Bearer\s+/,
        ''
      );

      ipcRenderer
        .invoke('getTokens')
        .then(async ({ accessToken, refreshToken }) => {
          if (!refreshToken)
            return Promise.reject('409: No refresh token found.');

          getNewToken(refreshToken)
            .then((tokens) => {
              console.log(tokens);
              const access = tokens.data.accessToken;

              ogRequest.headers.Authorization = 'Bearer ' + access;
              ogRequest.retry = true;

              const { port1 } = new MessageChannel();
              ipcRenderer.postMessage(
                'refreshtoken:fromrenderer',
                { currentUser: tokens.data },
                [port1]
              );

              return axios(ogRequest)
                .then((res) => {
                  console.log('spotify res? ', res);
                })
                .catch((e) => Promise.reject(e));
            })
            .catch((e) => console.log(e));

          //     // axios(ogRequest)
          //     //   .then()
          //     //   .catch((e) => Promise.reject(e));
          //     // try {
          //     //   await axios(ogRequest);
          //     // } catch (e) {
          //     //   console.log('eeee');
          //     //   return Promise.reject(e);
          //     // }
          //   })
          //   .catch((e) => {
          //     return Promise.reject(e);
          //   });
        });
    } else {
      return Promise.reject(error);
    }
  }
);

export default new DAO();

// TODO:
// OnlineFriends and stuff
