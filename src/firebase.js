import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC1XKjpaSKf8UVyykWpZ3TVK2Tuw59B0lk",
  authDomain: "athenaeum-library-system.firebaseapp.com",
  projectId: "athenaeum-library-system",
  storageBucket: "athenaeum-library-system.firebasestorage.app",
  messagingSenderId: "815029646976",
  appId: "1:815029646976:web:b30228bc925c50095c5865",
  measurementId: "G-DHX4NJBLHY"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo Firestore Database
const db = getFirestore(app);

export { db };
