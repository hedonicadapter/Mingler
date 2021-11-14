import firebase from 'firebase';

const config = {
  apiKey: 'AIzaSyDvwcnNKlwxZlGi3OGz_4BCVaVECRuj2kA',
  authDomain: 'sharehub-2fdfb.firebaseapp.com',
  projectId: 'sharehub-2fdfb',
  storageBucket: 'sharehub-2fdfb.appspot.com',
  messagingSenderId: '542998666825',
  appId: '1:542998666825:web:0ea6f84fea704beb2e2998',
  measurementId: 'G-MSS4CM3SNF',
};

let app = firebase.initializeApp(config);

// Enable offline persistence
firebase
  .firestore()
  .enablePersistence()
  .catch((e) => {
    if (e.code == 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled
      // in one tab at a time.
      console.log('Persistence can only be enabled in one tab at a time: ', e);
    } else if (e.code == 'unimplemented') {
      // The current browser does not support all of the
      // features required to enable persistence
      console.log('Browser incompatible: ', e);
    }
  });

//database access variable
const db = app.firestore();

//authentication variable
const auth = firebase.auth();

// //storage variable
// const cloud = firebase.storage();

//FieldValue/FieldPath
const field = firebase.firestore;

export { db, auth, field };
