import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  }

  function loginWithGitHub() {
    const provider = new GithubAuthProvider();
    return signInWithPopup(auth, provider);
  }

  function logout() {
    return signOut(auth);
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  useEffect(() => {
    let unsubscribeUserDoc = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch or create user in Firestore
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        let role = 'admin';
        let status = 'pending';
        
        let isSuperAdmin = user.email === 'superadmin@gmail.com';
        if (isSuperAdmin) {
          role = 'superadmin';
          status = 'active';
        }

        if (!userSnap.exists()) {
          const newUserData = {
            email: user.email,
            role,
            status,
            createdAt: new Date()
          };
          await setDoc(userRef, newUserData);
          setUserData(newUserData);
        } else {
          const existingData = userSnap.data();
          if (isSuperAdmin && (existingData.role !== 'superadmin' || existingData.status !== 'active')) {
            await updateDoc(userRef, { role: 'superadmin', status: 'active' });
            // onSnapshot will catch the update shortly, but we can optimistically set it here
            setUserData({ ...existingData, role: 'superadmin', status: 'active' });
          } else {
            setUserData(existingData);
          }
        }

        // Listen for changes (e.g. approval)
        unsubscribeUserDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            setUserData(null);
          }
          setLoading(false);
        });

      } else {
        setUserData(null);
        if (unsubscribeUserDoc) unsubscribeUserDoc();
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserDoc) unsubscribeUserDoc();
    };
  }, []);

  const value = {
    currentUser,
    userData,
    login,
    signup,
    loginWithGoogle,
    loginWithGitHub,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
