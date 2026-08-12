import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

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

// Khởi tạo Firebase App Check (Chống DoS và Spam bot)
// Yêu cầu bạn phải thêm biến môi trường VITE_RECAPTCHA_SITE_KEY trên Vercel sau khi bật trên Firebase Console
if (typeof window !== "undefined" && import.meta.env.VITE_RECAPTCHA_SITE_KEY) {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
    isTokenAutoRefreshEnabled: true
  });
}

// Khởi tạo Firestore Database
const db = getFirestore(app);

// Khởi tạo Firebase Auth
const auth = getAuth(app);

export { db, auth };
