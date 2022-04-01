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
}

export default new settingsDAO();
