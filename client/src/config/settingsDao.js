const { DAO, privateRoute } = require('./DAO');

class settingsDAO extends DAO {
  setUsername = (userID, newUsername, token) => {
    const data = { userID, newUsername };

    return privateRoute.post(`/setUsername`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };
  setEmail = (userID, newEmail, token) => {
    const data = { userID, newEmail };

    return privateRoute.post(`/setEmail`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };
  setProfilePicture = (formData, token) => {
    // const data = { userID, profilePicture };

    return privateRoute.post(`/setProfilePicture`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };
}

export default new settingsDAO();
