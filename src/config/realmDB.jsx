import * as Realm from 'realm-web';

const REALM_APP_ID = 'sharehub-rhajd'; // e.g. myapp-abcde

const config = {
  id: REALM_APP_ID,
  app: {
    name: 'ShareHub',
    version: '1.0.0',
  },
};

const app = new Realm.App(config);

const anonCredentials = Realm.Credentials.anonymous();

export { app, anonCredentials };
