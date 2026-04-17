import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  GoogleAuthProvider,
  signOut,
  signInWithCredential,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { auth, db } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loggingIn: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  dbUser: any | null;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe = () => {};
    let cancelled = false;
    const bootTimeout = window.setTimeout(() => {
      if (!cancelled) {
        setLoading(false);
      }
    }, 5000);

    const ensureUserDocument = async (currentUser: User) => {
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const newUser = {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          createdAt: serverTimestamp(),
          avgConsumptionCost: 30000,
          preferredDrink: 'Beer'
        };
        await setDoc(userRef, newUser);
        setDbUser(newUser);
        return;
      }

      setDbUser(userSnap.data());
    };

    unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (cancelled) return;

      console.info('[firebase] auth state changed', currentUser ? { uid: currentUser.uid, email: currentUser.email } : { uid: null });

      setUser(currentUser);
      window.clearTimeout(bootTimeout);
      setLoading(false);

      if (currentUser) {
        void ensureUserDocument(currentUser).catch((error) => {
          console.warn('Failed to ensure user document:', error);
        });
      } else {
        setDbUser(null);
      }
    });

    return () => {
      cancelled = true;
      window.clearTimeout(bootTimeout);
      unsubscribe();
    };
  }, []);

  const login = async () => {
    setAuthError(null);
    setLoggingIn(true);

    try {
      if (Capacitor.isNativePlatform()) {
        console.info('[auth] native Google sign-in started', { platform: Capacitor.getPlatform() });
        const result = await FirebaseAuthentication.signInWithGoogle({
          skipNativeAuth: true,
        });
        const idToken = result.credential?.idToken;
        if (!idToken) {
          throw new Error('Google 로그인 결과에서 ID 토큰을 받지 못했습니다.');
        }

        const credential = GoogleAuthProvider.credential(idToken, result.credential?.accessToken);
        await signInWithCredential(auth, credential);
        console.info('[auth] native Google sign-in completed', {
          uid: result.user?.uid,
          hasAccessToken: Boolean(result.credential?.accessToken),
        });
        return;
      }

      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Google 로그인에 실패했습니다.';
      setAuthError(message);
      throw error;
    } finally {
      setLoggingIn(false);
    }
  };

  const logout = async () => {
    if (Capacitor.isNativePlatform()) {
      await FirebaseAuthentication.signOut();
    }
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loggingIn, login, logout, dbUser, authError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
