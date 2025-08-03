'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
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

  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // User has successfully signed in with Google.
          // The onAuthStateChanged listener below will handle the user state update.
          // We just need to navigate them away from the login page.
          router.push('/');
        }
      } catch (error) {
        console.error("Erro ao obter resultado do redirecionamento do Google:", error);
      } finally {
        setLoading(false);
      }
    };

    handleRedirectResult();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      setLoading(true);
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
          // Caso para novos logins com Google
          const provider = firebaseUser.providerData[0].providerId === 'google.com' ? 'google' : 'password';
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
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const signUp = async ({ name, email, password }: SignUpData) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateFirebaseProfile(userCredential.user, { displayName: name });

    const newUserProfile: UserProfile = {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      name,
      provider: 'password',
      isSubscriber: false,
    };

    await setDoc(doc(firestore, 'usuarios', userCredential.user.uid), newUserProfile);
    setUser(newUserProfile);
  };

  const signIn = async ({ email, password }: SignInData) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const googleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  };

  const logOut = async () => {
    await signOut(auth);
    setUser(null);
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
