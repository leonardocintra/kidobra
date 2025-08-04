'use client';

import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  updateProfile as updateFirebaseProfile,
  updatePassword as updateFirebasePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';
import type { AuthContextType, SignUpData, SignInData, UpdateProfileData, UpdatePasswordData } from './AuthContext.types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleUser = useCallback(async (firebaseUser: User | null) => {
    if (firebaseUser && firebaseUser.email) {
      const userDocRef = doc(firestore, 'usuarios', firebaseUser.uid);
      const subscriptionDocRef = doc(firestore, 'assinaturas', firebaseUser.email);
      
      const [userDoc, subscriptionDoc] = await Promise.all([
          getDoc(userDocRef),
          getDoc(subscriptionDocRef)
      ]);
      
      const isSubscriber = subscriptionDoc.exists() && subscriptionDoc.data().ativo === true;

      if (userDoc.exists()) {
        setUser({ ...userDoc.data(), isSubscriber } as UserProfile);
      } else {
        const provider = firebaseUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'password';
        const newUserProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          provider,
          isSubscriber,
        };
        await setDoc(userDocRef, newUserProfile);
        setUser(newUserProfile);
      }
    } else {
      setUser(null);
    }
    // This is the key: always finish loading after handling the user.
    setLoading(false);
  }, []);

  useEffect(() => {
    // This effect runs only once on mount to handle the initial auth state.
    const processAuth = async () => {
        try {
            // Check if we are coming back from a Google Sign-in
            const result = await getRedirectResult(auth);
            if (result?.user) {
                // If so, the onAuthStateChanged listener below will handle the user profile creation/update.
                // We just need to make sure we redirect away from the login page.
                router.push('/');
            }
        } catch (error) {
            console.error("Error processing redirect result:", error);
        }
    };

    processAuth();
    
    // onAuthStateChanged is the single source of truth.
    // It will fire after getRedirectResult is complete, or on any other auth change.
    const unsubscribe = onAuthStateChanged(auth, handleUser);

    return () => unsubscribe();
  }, [handleUser, router]);


  const signUp = async ({ name, email, password }: SignUpData) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateFirebaseProfile(userCredential.user, { displayName: name });
    // Don't set user manually, let onAuthStateChanged handle it.
    await setDoc(doc(firestore, 'usuarios', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        name,
        provider: 'password',
    });
    router.push('/');
  };

  const signIn = async ({ email, password }: SignInData) => {
    await signInWithEmailAndPassword(auth, email, password);
    // Don't set user manually, let onAuthStateChanged handle it.
    router.push('/');
  };



  const googleSignIn = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  };

  const logOut = async () => {
    await signOut(auth);
    // User will be set to null by onAuthStateChanged
    router.push('/login');
  };

  const updateProfile = async ({ name }: UpdateProfileData) => {
    if (auth.currentUser) {
      await updateFirebaseProfile(auth.currentUser, { displayName: name });
      const userDocRef = doc(firestore, 'usuarios', auth.currentUser.uid);
      await setDoc(userDocRef, { name }, { merge: true });
      setUser((prevUser) => (prevUser ? { ...prevUser, name } : null));
    } else {
      throw new Error("No user is currently signed in.");
    }
  };

  const updatePassword = async ({ currentPassword, newPassword }: UpdatePasswordData) => {
    if (auth.currentUser && auth.currentUser.email) {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updateFirebasePassword(auth.currentUser, newPassword);
    } else {
      throw new Error("No user is currently signed in or user has no email.");
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    googleSignIn,
    logOut,
    updateProfile,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}