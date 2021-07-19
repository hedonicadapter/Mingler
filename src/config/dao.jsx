import axios from 'axios';
import { app } from './realmDB';

const http = axios.create({
  baseURL:
    'https://webhooks.mongodb-realm.com/api/client/v2.0/app/sharehub-rhajd/service/Mainframe/incoming_webhook',
  headers: {
    'Content-type': 'application/json',
  },
});

class DAO {
  async logOut() {
    await app?.currentUser?.logOut();
  }

  getFriends() {
    console.log(JSON.stringify(app?.currentUser?.id));
    // UserID retrieval happens server-side
    return http.get(`/getFriends`);
  }

  find(query, by = 'name', page = 0) {
    return http.get(`restaurants?${by}=${query}&page=${page}`);
  }

  createReview(data) {
    return http.post('/review-new', data);
  }

  updateReview(data) {
    return http.put('/review-edit', data);
  }

  deleteReview(id, userId) {
    return http.delete(`/review-delete?id=${id}`, {
      data: { user_id: userId },
    });
  }

  getCuisines(id) {
    return http.get(`/cuisines`);
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
