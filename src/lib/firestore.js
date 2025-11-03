import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  updateDoc,
  setDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { simpleHash } from './utils';
import { 
  isFirebaseAvailable, 
  mockCreateCalendar, 
  mockGetCalendar, 
  mockSaveMessage,
  mockFindCalendarByName,
  mockCheckCalendarNameExists
} from './mockStorage';

// Firebase 사용 가능 여부를 동적으로 확인하는 헬퍼 함수
const useFirebase = () => {
  return isFirebaseAvailable() && db !== null;
};

// 캘린더 컬렉션 가져오기
const getCalendarsCollection = () => {
  if (useFirebase() && db) {
    return collection(db, 'calendars');
  }
  return null;
};

/**
 * 새로운 캘린더 생성 (12월 달력 고정)
 */
export async function createCalendar(calendarName = null, password = null) {
  // Firebase가 없으면 목업 모드로 작동
  if (!useFirebase()) {
    console.log('🔄 Firebase가 없어 목업 모드로 작동합니다.');
    return mockCreateCalendar(calendarName, password);
  }
  console.log('[Firestore] B. createCalendar 함수 시작:', { calendarName, password });
  try {
    const calendarData = {
      startDate: '2025-12-01',
      endDate: '2025-12-31',
      createdAt: new Date(),
      messages: {}, // 날짜별 메시지 배열 저장
      calendarName: calendarName || null,
      passwordHash: password ? simpleHash(password) : null
    };
    
    console.log('[Firestore] B-1. 생성할 캘린더 데이터:', calendarData);
    const calendarsCollection = getCalendarsCollection();
    if (!calendarsCollection) {
      console.error('[Firestore] B-2. calendars 컬렉션을 가져올 수 없습니다.');
      throw new Error('Firebase 컬렉션을 가져올 수 없습니다.');
    }
    console.log('[Firestore] B-3. addDoc 함수 실행 직전');
    const docRef = await addDoc(calendarsCollection, calendarData);
    console.log('[Firestore] B-4. addDoc 함수 실행 성공, ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('[Firestore] B-5. 캘린더 생성 실패:', error);
    console.error('에러 코드:', error.code);
    console.error('에러 메시지:', error.message);
    // Firebase 실패 시 목업 모드로 폴백
    return mockCreateCalendar(calendarName, password);
  }
}

/**
 * 캘린더 이름 중복 체크
 */
export async function checkCalendarNameExists(calendarName) {
  // Firebase가 없으면 목업 모드로 작동
  if (!useFirebase()) {
    return mockCheckCalendarNameExists(calendarName);
  }
  console.log('[Firestore] A. checkCalendarNameExists 함수 시작:', calendarName);
  try {
    const calendarsCollection = getCalendarsCollection();
    if (!calendarsCollection) {
      console.error('[Firestore] A-1. calendars 컬렉션을 가져올 수 없습니다.');
      throw new Error('Firebase 컬렉션을 가져올 수 없습니다.');
    }
    const q = query(
      calendarsCollection,
      where('calendarName', '==', calendarName)
    );
    
    console.log('[Firestore] A-2. getDocs 쿼리 실행 직전');
    const querySnapshot = await getDocs(q);
    console.log('[Firestore] A-3. getDocs 쿼리 결과 받음. empty:', querySnapshot.empty);
    return !querySnapshot.empty; // 중복이면 true
  } catch (error) {
    console.error('[Firestore] A-4. 이름 중복 체크 실패:', error);
    console.error('Firestore Error Code:', error.code);
    console.error('Firestore Error Message:', error.message);
    return mockCheckCalendarNameExists(calendarName);
  }
}

/**
 * 이름과 비밀번호로 캘린더 찾기
 */
export async function findCalendarByName(calendarName, password) {
  // Firebase가 없으면 목업 모드로 작동
  if (!useFirebase()) {
    return mockFindCalendarByName(calendarName, password);
  }

  try {
    const passwordHash = simpleHash(password);
    const calendarsCollection = getCalendarsCollection();
    if (!calendarsCollection) {
      throw new Error('Firebase 컬렉션을 가져올 수 없습니다.');
    }
    const q = query(
      calendarsCollection,
      where('calendarName', '==', calendarName),
      where('passwordHash', '==', passwordHash)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    
    return null;
  } catch (error) {
    console.error('캘린더 찾기 실패, 목업 모드로 전환:', error);
    return mockFindCalendarByName(calendarName, password);
  }
}

/**
 * 캘린더 조회
 */
export async function getCalendar(calendarId) {
  // Firebase가 없으면 목업 모드로 작동
  if (!useFirebase()) {
    return mockGetCalendar(calendarId);
  }

  try {
    const docRef = doc(db, 'calendars', calendarId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('캘린더 조회 실패, 목업 모드로 전환:', error);
    // Firebase 실패 시 목업 모드로 폴백
    return mockGetCalendar(calendarId);
  }
}

/**
 * 특정 날짜에 메시지 저장 (배열로 저장하여 여러 개 저장 가능)
 */
export async function saveMessage(calendarId, date, message) {
  // Firebase가 없으면 목업 모드로 작동
  if (!useFirebase()) {
    return mockSaveMessage(calendarId, date, message);
  }

  console.log('[Firestore] C. saveMessage 함수 시작:', { calendarId, date, message });
  try {
    const calendarRef = doc(db, 'calendars', calendarId);
    console.log('[Firestore] C-1. 캘린더 참조 생성 완료');
    
    const calendar = await getCalendar(calendarId);
    console.log('[Firestore] C-2. 캘린더 조회 완료:', calendar ? '찾음' : '없음');
    
    if (!calendar) {
      throw new Error('캘린더를 찾을 수 없습니다.');
    }
    
    // messages 객체에 날짜별 메시지 배열로 저장
    const messages = calendar.messages || {};
    if (!messages[date]) {
      messages[date] = [];
    }
    messages[date].push({
      text: message,
      createdAt: new Date().toISOString()
    });
    
    console.log('[Firestore] C-3. 업데이트할 메시지 데이터 준비 완료');
    console.log('[Firestore] C-4. updateDoc 실행 직전');
    
    await updateDoc(calendarRef, {
      messages: messages
    });
    
    console.log('[Firestore] C-5. updateDoc 성공!');
    return true;
  } catch (error) {
    console.error('[Firestore] C-6. 메시지 저장 실패:', error);
    console.error('에러 코드:', error.code);
    console.error('에러 메시지:', error.message);
    // Firebase 실패 시 목업 모드로 폴백
    return mockSaveMessage(calendarId, date, message);
  }
}

