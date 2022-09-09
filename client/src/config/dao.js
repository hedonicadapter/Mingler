import React from 'react';
import axios from 'axios';
import { ipcRenderer } from 'electron';

const baseURL = 'https://menglir.herokuapp.com/';
// const baseURL = 'http://localhost:8080/';

const auth = axios.create({
  baseURL: `${baseURL}api/auth/`,
  timeout: 6000,
  headers: {
    'Content-type': 'application/json',
  },
});

export const privateRoute = axios.create({
  baseURL: `${baseURL}api/private/`,
  timeout: 6000,
  withCredentials: true,
  headers: {
    'Content-type': 'application/json',
  },
});

export const token = axios.create({
  baseURL: `${baseURL}api/token/`,
  timeout: 4000,
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
    // TODO:
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

  deleteFriend = (userID, friendID, token) => {
    const data = { userID, friendID };

    return privateRoute.post(`/deleteFriend`, data, {
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
    console.warn({ token });
    return privateRoute.get(
      '/createSpotifyURL',
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
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

  initDemoAccount = (clientFingerprint) => {
    const data = { clientFingerprint };

    return auth.post('/initDemoAccount', data);
  };

  createTracktivity = (trackInfo) => {
    const data = { trackInfo };

    return privateRoute.post('/createTracktivity', data);
  };

  getDemoActivities = () => {
    return privateRoute.get('/getDemoActivities');
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
  async function (error) {
    const ogRequest = error.config;
    console.warn({ status: error.response.status });
    if (401 === error.response.status && !ogRequest.retry) {
      // const oldAccessToken = ogRequest.headers.Authorization.replace(
      //   /^Bearer\s+/,
      //   ''
      // );

      const { accessToken, refreshToken } = await ipcRenderer.invoke(
        'getTokens'
      );
      if (!refreshToken) return Promise.reject('Failed to get refresh token.');

      const newTokens = await getNewToken(refreshToken);
      console.log({ newTokens });

      if (!newTokens) return Promise.reject('Failed to get new tokens.');

      const access = newTokens.data.accessToken;

      ogRequest.headers.Authorization = 'Bearer ' + access;
      ogRequest.retry = true;

      const { port1 } = new MessageChannel();
      ipcRenderer.postMessage(
        'refreshtoken:fromrenderer',
        { currentUser: newTokens.data },
        [port1]
      );

      return axios(ogRequest);
    } else {
      return Promise.reject(error);
    }
  }
);

export default new DAO();
