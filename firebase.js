import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAvzrOXO8q7lhQZwMW-2WOSK5frfeCDnSs",
  authDomain: "mynotesapp-e3a52.firebaseapp.com",
  projectId: "mynotesapp-e3a52",
  storageBucket: "mynotesapp-e3a52.firebasestorage.app",
  messagingSenderId: "342855217250",
  appId: "1:342855217250:web:eac6d38cf06032ce48213b",
  measurementId: "G-C28W0HX59Q"
};

// Initialisation de Firebase si aucune n'est initialisée
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Auth avec persistance : L'utilisateur reste connecté même après fermeture de l'app
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage) //AsyncStorage :Stocke le token d'authentification localement sur le téléphone
});

// Firestore
export const db = getFirestore(app);
