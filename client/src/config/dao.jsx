import axios from 'axios';
import { app } from './realmDB';

const auth = axios.create({
  baseURL: 'http://localhost:8080/api/auth/',
  headers: {
    'Content-type': 'application/json',
  },
});

const private = axios.create({
  baseURL: 'http://localhost:8080/api/private/',
  headers: {
    'Content-type': 'application/json',
  },
});

export const setAuthToken = (token) => {
  if (token) {
    private.defaults.headers.common['Authorization'] = 'Bearer ' + token;
  } else {
    //deleting the token from header
    delete private.defaults.headers.common['Authorization'];
  }
};

class DAO {
  async logOut() {
    await app?.currentUser?.logOut();
  }

  registerGuest(username, clientFingerprint) {
    const data = { username, clientFingerprint };

    return auth.post('/registerGuest', data);
  }

  loginGuest(guestID, clientFingerprint) {
    const data = { guestID, clientFingerprint };

    return auth.post('/loginGuest', data);
  }

  login(email, password, clientFingerprint) {
    const data = { email, password, clientFingerprint };

    return auth.post('/login', data);
  }

  findUserByEmail(email) {
    return auth.get(`/findUser?email=${email}`);
  }

  getFriends(userID) {
    console.log(userID);
    const data = { userID };

    return user.get(`/getFriends`, data);
  }

  find(query, by = 'name', page = 0) {
    return auth.get(`restaurants?${by}=${query}&page=${page}`);
  }

  createReview(data) {
    return auth.post('/review-new', data);
  }

  updateReview(data) {
    return auth.put('/review-edit', data);
  }

  deleteReview(id, userId) {
    return auth.delete(`/review-delete?id=${id}`, {
      data: { user_id: userId },
    });
  }

  getCuisines(id) {
    return auth.get(`/cuisines`);
  }
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
