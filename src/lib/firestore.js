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
  if (!useFirebase()) {
    return mockCreateCalendar(calendarName, password);
  }
  
  try {
    const calendarData = {
      startDate: '2025-12-01',
      endDate: '2025-12-31',
      createdAt: new Date(),
      messages: {},
      calendarName: calendarName || null,
      passwordHash: password ? simpleHash(password) : null
    };
    
    const calendarsCollection = getCalendarsCollection();
    if (!calendarsCollection) {
      throw new Error('Firebase 컬렉션을 가져올 수 없습니다.');
    }
    
    const docRef = await addDoc(calendarsCollection, calendarData);
    return docRef.id;
  } catch (error) {
    console.error('캘린더 생성 실패:', error);
    return mockCreateCalendar(calendarName, password);
  }
}

/**
 * 캘린더 이름 중복 체크
 */
export async function checkCalendarNameExists(calendarName) {
  if (!useFirebase()) {
    return mockCheckCalendarNameExists(calendarName);
  }
  
  try {
    const calendarsCollection = getCalendarsCollection();
    if (!calendarsCollection) {
      throw new Error('Firebase 컬렉션을 가져올 수 없습니다.');
    }
    
    const q = query(
      calendarsCollection,
      where('calendarName', '==', calendarName)
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('이름 중복 체크 실패:', error);
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
  if (!useFirebase()) {
    return mockSaveMessage(calendarId, date, message);
  }

  try {
    const calendarRef = doc(db, 'calendars', calendarId);
    const calendar = await getCalendar(calendarId);
    
    if (!calendar) {
      throw new Error('캘린더를 찾을 수 없습니다.');
    }
    
    const messages = calendar.messages || {};
    if (!messages[date]) {
      messages[date] = [];
    }
    messages[date].push({
      text: message,
      createdAt: new Date().toISOString()
    });
    
    await updateDoc(calendarRef, {
      messages: messages
    });
    
    return true;
  } catch (error) {
    console.error('메시지 저장 실패:', error);
    return mockSaveMessage(calendarId, date, message);
  }
}

