// Get current user's ID

// Get friends' IDs of current user by current user's ID
exports = async function (payload, response) {
  const { current_user_id = BSON.ObjectId('') } = payload.query;

  const userCollection = context.services
    .get('mongodb-atlas')
    .db('ShareHub')
    .collection('users');

  const current_user_friends = await userCollection.find(
    { _id: current_user_id },
    { friends: 1 }
  );

  const query = { _id: { $in: current_user_friends } };

  const friend_ids = await userCollection.find(query);

  console.log(friend_ids);
  return friend_ids;
};

// Get activities of each friend by their IDs ordered by date
exports = async function (payload, response) {
  const {} = payload.query;

  const collection = context.services
    .get('mongodb-atlas')
    .db('Sharehub')
    .collection('users');

  const query = { _id: { $in: [collection.friends] } };

  const friend_ids = await api.users.find(query);

  return friend_ids;
};

// Set name of current user

// Set active window

// Set active track

// TODO:
// OnlineFriends and stuff
// Search
