import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyBMLApWa9aHWDhe7ZhAWU--0JcqU-oINZM",
  authDomain: "neurodraw-842b1.firebaseapp.com",
  projectId: "neurodraw-842b1",
  storageBucket: "neurodraw-842b1.firebasestorage.app",
  messagingSenderId: "799467420347",
  appId: "1:799467420347:web:ce2388fcfb96a5cd63079e"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
