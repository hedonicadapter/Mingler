import * as Realm from 'realm-web';

const REALM_APP_ID = 'sharehub-rhajd'; // e.g. myapp-abcde
// const Store = require('electron-store');

// const store = new Store();
// const returningAnonUserID = store.get('returningAnonUserID');

const config = {
  id: REALM_APP_ID,
  app: {
    name: 'ShareHub',
    version: '1.0.0',
  },
};

const app = new Realm.App(config);

const anonCredentials = Realm.Credentials.emailPassword(
  'eheh.jasper@example.com',
  '§!´DontBruteforceMe'
);
// const anonCredentials = Realm.Credentials.function({
//   username: 'anonamoose',
//   returningAnonUserID: '60fd471a468713f86c93d5a3',
// });

export { app, anonCredentials };
