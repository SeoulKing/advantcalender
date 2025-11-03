// Firebase 기본 연동
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase 설정은 환경변수나 별도 설정 파일에서 관리하세요
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'your-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'your-auth-domain',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'your-project-id',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'your-storage-bucket',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'your-messaging-sender-id',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'your-app-id',
};

// Firebase 설정 검증
const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey !== 'your-api-key' &&
         firebaseConfig.projectId !== 'your-project-id' &&
         firebaseConfig.appId !== 'your-app-id';
};

let app;
let db = null;

try {
  if (!isFirebaseConfigured()) {
    console.warn('⚠️ Firebase 설정이 필요합니다. .env 파일에 Firebase 설정을 추가해주세요.');
    console.warn('📦 목업 모드로 작동합니다. (localStorage 사용)');
    console.warn('현재 설정:', {
      hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
      hasProjectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
      hasAppId: !!import.meta.env.VITE_FIREBASE_APP_ID
    });
  } else {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app, 'database1');
    console.log('✅ Firebase 초기화 완료 (데이터베이스: database1)');
  }
} catch (error) {
  console.error('❌ Firebase 초기화 실패, 목업 모드로 전환:', error);
  console.warn('📦 목업 모드로 작동합니다. (localStorage 사용)');
  db = null;
}

export { db };
