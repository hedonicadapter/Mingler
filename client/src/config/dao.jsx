import axios from 'axios';
import { app } from './realmDB';

const auth = axios.create({
  baseURL: 'http://localhost:8080/api/auth/',
  headers: {
    'Content-type': 'application/json',
  },
});
// const auth = axios.create({
//   baseURL:
//     'auths://webhooks.mongodb-realm.com/api/client/v2.0/app/sharehub-rhajd/service/Mainframe/incoming_webhook',
//   headers: {
//     'Content-type': 'application/json',
//   },
// });

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

  findUserByEmail(email) {
    return auth.get(`/findUser?email=${email}`);
  }

  getFriends() {
    // UserID retrieval happens server-side
    return auth.get(`/getFriends`);
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
