exports = async function (loginPayload) {
  const nameGenerator = require('@yung_samba/positive-name-generator');

  const users = context.services
    .get('mongodb-atlas')
    .db('ShareHub')
    .collection('users');

  const { username, returningAnonUserID } = loginPayload;

  const foundUser = await users.findOne({ id: returningAnonUserID });

  // async function createAnonymousUser() {
  //   return new BSON.ObjectId().toString();
  // }

  const createNewDbUser = async () => {
    const newUsername = nameGenerator();

    const dbUser = await users.findOne({ user_name: newUsername });

    if (dbUser) {
      // If exists, recurse function until a random name that doesn't exist can be used
      createNewDbUser();
    } else {
      // If user does not exist, create it and return it

      const newUser = {
        user_name: newUsername,
        id: new BSON.ObjectId(),
        guest: true,
        eventLog: [{ created: new Date() }],
      };
      const result = await users.insertOne(newUser);

      return result.id.toString();
    }
  };

  if (returningAnonUserID) {
    return foundUser._id.toString();
  } else if (username === 'anonamoose') {
    return createNewDbUser();
  }
};
