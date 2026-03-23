'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

export function initializeFirebase() {
  if (!getApps().length) {
    let firebaseApp;
    try {
      // Tenta inicializar com a config primeiro para evitar erros em ambientes como Vercel
      // onde a inicialização automática sem argumentos falha.
      if (typeof window !== 'undefined' && (window as any).firebaseConfig) {
        firebaseApp = initializeApp(firebaseConfig);
      } else {
        // Fallback para inicialização automática ou manual com config
        firebaseApp = initializeApp(firebaseConfig);
      }
    } catch (e) {
      console.warn('Firebase initialization warning:', e);
      firebaseApp = initializeApp(firebaseConfig);
    }

    return getSdks(firebaseApp);
  }

  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
