import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDCkqTlG3_G21_KypEWjFjbGJDj5RptD1k",
  authDomain: "remindzone-35aeb.firebaseapp.com",
  projectId: "remindzone-35aeb",
  storageBucket: "remindzone-35aeb.firebasestorage.app",
  messagingSenderId: "518664762637",
  appId: "1:518664762637:web:5cc93ae109908606cc6c44",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

export { auth, db, app }

