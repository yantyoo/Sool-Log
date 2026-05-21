import { Capacitor } from '@capacitor/core';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, indexedDBLocalPersistence, initializeAuth, type Auth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { emitToast } from './toast';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
let authInstance: Auth | null = null;

export function getFirebaseAuth() {
  if (authInstance) {
    return authInstance;
  }

  const platform = Capacitor.getPlatform();
  const useNativeAuth = platform === 'ios' || platform === 'android';

  authInstance = useNativeAuth
    ? initializeAuth(app, {
        persistence: indexedDBLocalPersistence,
      })
    : getAuth(app);

  console.info('[firebase] auth initialized', {
    platform,
    useNativeAuth,
  });

  return authInstance;
}

export const firebaseApp = app;
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

console.info('[firebase] initialized', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  firestoreDatabaseId: firebaseConfig.firestoreDatabaseId,
});

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const auth = getFirebaseAuth();
  const errorCode = typeof error === 'object' && error && 'code' in error ? String((error as { code?: unknown }).code) : null;
  const friendlyMessage =
    errorCode === 'permission-denied'
      ? '접근 권한이 없습니다. 로그인 상태와 보안 규칙을 확인해주세요.'
      : errorCode === 'unavailable' || errorCode === 'network-request-failed'
        ? '저장에 실패했습니다. 네트워크 상태를 확인한 뒤 다시 시도해주세요.'
        : '데이터를 불러오지 못했습니다.';
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  emitToast({
    tone: errorCode === 'permission-denied' ? 'warning' : 'error',
    title: friendlyMessage,
    description: path ? `경로: ${path}` : undefined,
    action: {
      label: '다시 시도',
      onClick: () => window.location.reload(),
    },
  });
  throw new Error(JSON.stringify(errInfo));
}
