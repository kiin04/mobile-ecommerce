import { initializeApp } from "firebase/app";
import {
    getAuth,
    sendEmailVerification,
} from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCe3nP6Z_f6KAIJSAfWVcPUrremo0DLbNg",
    authDomain: "backend-ace60.firebaseapp.com",
    projectId: "backend-ace60",
    storageBucket: "backend-ace60.firebasestorage.app",
    messagingSenderId: "111841743198",
    appId: "1:111841743198:web:b0c0d62c7982de8501ffcf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Export the auth object and sendEmailVerification function
export { auth, sendEmailVerification };