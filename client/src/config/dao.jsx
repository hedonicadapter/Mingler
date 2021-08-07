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

// export const setAuthToken = (token) => {
//   console.log('hy ', token);
//   // if (token) {
//   //   axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
//   // } else {
//   //   //deleting the token from header
//   //   delete axios.defaults.headers.common['Authorization'];
//   // }
//   privateRoute.interceptors.request.use(function (config) {
//     if (token) config.headers.Authorization = `Bearer ${token}`;
//     else config.headers.Authorization = null;

//     return config;
//   });
// };

class DAO {
  token = undefined;

  async setAuthToken(token) {
    this.token = token;
    return await token;
  }

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
    const token = localStorage.getItem('token');
    const data = { userID };

    return privateRoute.post(`/getFriends`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
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
