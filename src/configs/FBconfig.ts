import {initializeApp, getApps, getApp} from 'firebase/app';
import {getFirestore} from 'firebase/firestore';
import {getAuth} from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyC1Eb3n5f7I2CP5f_w1krUJJQmyV6giP9c',
  authDomain: 'eduapp-adc82.firebaseapp.com',
  projectId: 'eduapp-adc82',
  storageBucket: 'eduapp-adc82.appspot.com',
  messagingSenderId: '883070566264',
  appId: '1:883070566264:android:9f9810677ff82b6bd1128d',
};

// ✅ Initialize Firebase app với check để tránh re-initialize
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ✅ Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export {app};
