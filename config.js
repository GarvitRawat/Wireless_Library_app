import * as firebase from 'firebase';
require('@firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyAQyNpvAp-W_hLVjAfyUAzhyDhlCA7aaPk',
  authDomain: 'wireless-library-ac40b.firebaseapp.com',
  databaseURL: 'https://wireless-library-ac40b.firebaseio.com',
  projectId: 'wireless-library-ac40b',
  storageBucket: 'wireless-library-ac40b.appspot.com',
  messagingSenderId: '151087060972',
  appId: '1:151087060972:web:96b338d111d00711cd52c9',
};

if(!firebase.apps.length){ let app = firebase.initializeApp(firebaseConfig) }

export default firebase.firestore();
