import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  GoogleAuthProvider,
  signOut,
  signInWithCredential,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
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
  login: (providerName: 'google' | 'apple' | 'kakao') => Promise<void>;
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

  const signInOrCreateFirebaseUser = async (email: string, secret: string, nickname: string, photoURL: string) => {
    const auth = getFirebaseAuth();
    try {
      const credential = await signInWithEmailAndPassword(auth, email, secret);
      return credential.user;
    } catch (err: any) {
      if (
        err.code === 'auth/user-not-found' || 
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password'
      ) {
        try {
          const credential = await createUserWithEmailAndPassword(auth, email, secret);
          await updateProfile(credential.user, {
            displayName: nickname,
            photoURL: photoURL
          });
          return credential.user;
        } catch (createErr) {
          console.error('Failed to create user, attempting sign-in as fallback', createErr);
          // If creation fails due to email already in use, try to sign in again or throw
          const credential = await signInWithEmailAndPassword(auth, email, secret);
          return credential.user;
        }
      }
      throw err;
    }
  };

  const mockKakaoLogin = async () => {
    const proceed = window.confirm("카카오 Developers 앱 등록(KOE009 등)이 활성화되지 않은 상태입니다.\n테스트용 모의 카카오 로그인을 진행하시겠습니까?");
    if (!proceed) {
      throw new Error('사용자가 Kakao 로그인을 취소했습니다.');
    }
    const mockId = 'test_kakao_user';
    const email = 'kakao_test_user@soollog.com';
    const nickname = '모의 카카오 유저 🍻';
    const photoURL = '';
    return await signInOrCreateFirebaseUser(email, `kakao_secret_${mockId}`, nickname, photoURL);
  };

  const login = async (providerName: 'google' | 'apple' | 'kakao') => {
    setAuthError(null);
    setLoggingIn(true);
    const auth = getFirebaseAuth();
    const platform = Capacitor.getPlatform();
    const useNativeAuth = platform === 'ios' || platform === 'android';

    try {
      console.info('[auth] login requested', { providerName, platform, useNativeAuth });

      if (providerName === 'google') {
        if (useNativeAuth) {
          console.info('[auth] native Google sign-in started', { platform });
          const result = await FirebaseAuthentication.signInWithGoogle();
          const idToken = result.credential?.idToken;
          if (!idToken) {
            throw new Error('Google 로그인 결과에서 ID 토큰을 받지 못했습니다. Firebase 설정(SHA-1 등)을 확인해주세요.');
          }
          const credential = GoogleAuthProvider.credential(idToken);
          await signInWithCredential(auth, credential);
        } else {
          console.info('[auth] web Google sign-in started', { platform });
          const provider = new GoogleAuthProvider();
          provider.setCustomParameters({ prompt: 'select_account' });
          await signInWithPopup(auth, provider);
        }
      } 
      else if (providerName === 'apple') {
        if (useNativeAuth) {
          console.info('[auth] native Apple sign-in started', { platform });
          const result = await FirebaseAuthentication.signInWithApple();
          const idToken = result.credential?.idToken;
          const rawNonce = result.credential?.rawNonce;
          const { OAuthProvider } = await import('firebase/auth');
          const credential = OAuthProvider.credential({
            providerId: 'apple.com',
            idToken: idToken || '',
            rawNonce: rawNonce || ''
          });
          await signInWithCredential(auth, credential);
        } else {
          console.info('[auth] web Apple sign-in started', { platform });
          const { OAuthProvider } = await import('firebase/auth');
          const provider = new OAuthProvider('apple.com');
          try {
            await signInWithPopup(auth, provider);
          } catch (error: any) {
            console.warn('[auth] Apple login failed, trying mock fallback', error);
            const proceed = window.confirm("애플 로그인이 Firebase Console에 설정되지 않은 상태입니다.\n테스트용 모의 애플 로그인을 진행하시겠습니까?");
            if (!proceed) throw error;
            
            const mockId = 'test_apple_user';
            const email = 'apple_test_user@soollog.com';
            const nickname = '모의 애플 유저 ';
            await signInOrCreateFirebaseUser(email, `apple_secret_${mockId}`, nickname, '');
          }
        }
      } 
      else if (providerName === 'kakao') {
        const Kakao = (window as any).Kakao;
        const kakaoAppKey = import.meta.env.VITE_KAKAO_APP_KEY || '1780cb03ee11a51167389ea1c2a13cc7'; // Default test key
        
        if (Kakao && !Kakao.isInitialized()) {
          Kakao.init(kakaoAppKey);
        }

        await new Promise<void>((resolve, reject) => {
          if (!Kakao || !Kakao.Auth || !Kakao.Auth.login) {
            console.warn('Kakao SDK not loaded or incomplete, using mock fallback');
            mockKakaoLogin().then(resolve).catch(reject);
            return;
          }
          Kakao.Auth.login({
            success: function(authObj: any) {
              console.info('[auth] Kakao login success', authObj);
              Kakao.API.request({
                url: '/v2/user/me',
                success: async function(response: any) {
                  console.info('[auth] Kakao user profile', response);
                  try {
                    const kakaoId = response.id;
                    const email = response.kakao_account?.email || `kakao_${kakaoId}@soollog.com`;
                    const nickname = response.properties?.nickname || response.kakao_account?.profile?.nickname || '카카오 사용자';
                    const photoURL = response.kakao_account?.profile?.thumbnail_image_url || '';
                    
                    await signInOrCreateFirebaseUser(email, `kakao_secret_${kakaoId}`, nickname, photoURL);
                    resolve();
                  } catch (err) {
                    reject(err);
                  }
                },
                fail: function(err: any) {
                  reject(new Error('Kakao profile request failed: ' + JSON.stringify(err)));
                }
              });
            },
            fail: function(err: any) {
              console.error('[auth] Kakao login failed', err);
              console.warn('Kakao SDK login failed, using mock fallback');
              mockKakaoLogin().then(resolve).catch(reject);
            }
          });
        });
      }
    } catch (error: any) {
      console.error('[auth] login error', error);
      let message = '로그인에 실패했습니다.';
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
