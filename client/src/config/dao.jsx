import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { app } from './realmDB';

const auth = axios.create({
  baseURL: 'http://localhost:8080/api/auth/',
  headers: {
    'Content-type': 'application/json',
  },
});

const privateRoute = axios.create({
  baseURL: 'http://localhost:8080/api/private/',
  withCredentials: true,
  headers: {
    'Content-type': 'application/json',
  },
});

class DAO {
  // token = undefined;

  // const setAuthToken = async (token) => {
  // this.token = token;
  // return await token;
  // };

  registerGuest = (username, clientFingerprint) => {
    const data = { username, clientFingerprint };

    return auth.post('/registerGuest', data);
  };

  loginGuest = (guestID, clientFingerprint) => {
    const data = { guestID, clientFingerprint };

    return auth.post('/loginGuest', data);
  };

  login = (email, password, clientFingerprint) => {
    const data = { email, password, clientFingerprint };

    return auth.post('/login', data);
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
    const data = { searchTerm };

    return privateRoute.post('/searchUsers', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  sendFriendRequest = (toID, fromID, token) => {
    const data = { to: toID, from: fromID };
    console.log(data);

    return privateRoute.post('/sendFriendRequest', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };
}

export default new DAO();

// Get friends' IDs of current user by current user's ID

// Get activities of each friend by their IDs ordered by date
// Set name of current user

// Set active window

// Set active track

// TODO:
// OnlineFriends and stuff
// Search
