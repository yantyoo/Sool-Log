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
import { db, getFirebaseAuth } from '../lib/firebase';
import { emitToast } from '../lib/toast';

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
    const auth = getFirebaseAuth();
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
    const auth = getFirebaseAuth();
    const platform = Capacitor.getPlatform();
    const useNativeAuth = platform === 'ios' || platform === 'android';

    try {
      console.info('[auth] login requested', { platform, useNativeAuth });

      if (useNativeAuth) {
        console.info('[auth] native Google sign-in started', { platform });
        const result = await FirebaseAuthentication.signInWithGoogle();
        
        // Native SDK에서 반환된 idToken 사용
        const idToken = result.credential?.idToken;
        if (!idToken) {
          throw new Error('Google 로그인 결과에서 ID 토큰을 받지 못했습니다. Firebase 설정(SHA-1 등)을 확인해주세요.');
        }

        const credential = GoogleAuthProvider.credential(idToken);
        const userCredential = await signInWithCredential(auth, credential);
        
        console.info('[auth] native Google sign-in completed', {
          uid: userCredential.user.uid,
          email: userCredential.user.email
        });
        return;
      }

      // Web/Desktop 환경
      console.info('[auth] web Google sign-in started', { platform });
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const result = await signInWithPopup(auth, provider);
      console.info('[auth] web Google sign-in completed', {
        uid: result.user.uid,
        email: result.user.email
      });
    } catch (error: any) {
      console.error('[auth] login error', error);
      let message = 'Google 로그인에 실패했습니다.';
      
      if (error.code === 'auth/popup-blocked') {
        message = '브라우저 팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요.';
      } else if (error.code === 'auth/network-request-failed') {
        message = '네트워크 연결을 확인한 뒤 다시 시도해주세요.';
      } else if (error.message) {
        message = error.message;
      }
      
      setAuthError(message);
      emitToast({
        tone: 'error',
        title: '로그인 실패',
        description: message,
      });
      throw error;
    } finally {
      setLoggingIn(false);
    }
  };

  const logout = async () => {
    const auth = getFirebaseAuth();
    const platform = Capacitor.getPlatform();
    if (platform === 'ios' || platform === 'android') {
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
