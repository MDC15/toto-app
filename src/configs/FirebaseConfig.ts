// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDnbGme3bWu-fQBaFzPJRsWi6HFickh8io",
    authDomain: "todo-lisst-9f2b3.firebaseapp.com",
    projectId: "todo-lisst-9f2b3",
    storageBucket: "todo-lisst-9f2b3.firebasestorage.app",
    messagingSenderId: "828155943847",
    appId: "1:828155943847:web:195dc88e61b2ab62d87482",
    measurementId: "G-WK2HVSD3MJ"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app);
