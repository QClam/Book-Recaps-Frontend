// firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyBXAWRmuKhBE22Pg2djkTjJAQs8gKrhmus",
    authDomain: "sep491-5953b.firebaseapp.com",
    databaseURL: "https://sep491-5953b-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "sep491-5953b",
    storageBucket: "sep491-5953b.appspot.com",
    messagingSenderId: "421698815852",
    appId: "1:421698815852:web:7eeb986220f962baa95549",
    measurementId: "G-WPRM6G7LC4"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const analytics = getAnalytics(app);

export { database };
