// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userAuth) => {
      if (userAuth) {
        try {
          console.log('Auth state changed, fetching user data for:', userAuth.uid);
          const userDoc = await getDoc(doc(firestore, 'users', userAuth.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('User data found:', userData);
            setUser({ 
              uid: userAuth.uid, 
              email: userAuth.email, 
              ...userData 
            });
          } else {
            console.log('No user document found, creating default student role');
            // Create a default user document if it doesn't exist
            const defaultUserData = {
              email: userAuth.email,
              role: 'student', // Default role for regular signups
              name: userAuth.displayName || 'User',
              createdAt: new Date()
            };
            await setDoc(doc(firestore, 'users', userAuth.uid), defaultUserData);
            setUser({ 
              uid: userAuth.uid, 
              email: userAuth.email, 
              ...defaultUserData 
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Set default student role on error
          setUser({ 
            uid: userAuth.uid, 
            email: userAuth.email, 
            role: 'student',
            name: userAuth.displayName || 'User'
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email, password, userData) => {
    try {
      console.log('Starting registration with data:', userData);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile with display name
      const displayName = userData.name || userData.companyName || 'User';
      await updateProfile(user, {
        displayName: displayName
      });

      // Save user data to Firestore with proper role
      const userDoc = {
        email: email,
        role: userData.role || 'student', // Use provided role or default to student
        name: displayName,
        createdAt: new Date(),
        ...userData
      };

      console.log('Saving user document with role:', userDoc.role);
      await setDoc(doc(firestore, 'users', user.uid), userDoc);

      console.log('Registration completed successfully');
      
      // Sign out the user immediately after registration
      await signOut(auth);
      console.log('User signed out after registration');
      
      return { success: true, message: 'Registration successful! Please login with your credentials.' };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    return signOut(auth);
  };

  const value = {
    user,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};