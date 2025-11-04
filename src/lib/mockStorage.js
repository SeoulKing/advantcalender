// Firebase 없이 테스트할 수 있는 목업 스토리지
// localStorage를 사용하여 캘린더 데이터 저장

import { simpleHash } from './utils';

const CALENDARS_STORAGE_KEY = 'mock_calendars';

/**
 * Firebase 연결 확인
 */
export function isFirebaseAvailable() {
  try {
    const config = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'your-api-key',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'your-project-id',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || 'your-app-id',
    };
    
    return config.apiKey !== 'your-api-key' &&
           config.projectId !== 'your-project-id' &&
           config.appId !== 'your-app-id';
  } catch {
    return false;
  }
}

/**
 * 목업: 캘린더 생성
 */
export function mockCreateCalendar(calendarName = null, password = null) {
  const calendarId = 'mock_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  
  const calendarData = {
    id: calendarId,
    startDate: '2025-12-01',
    endDate: '2025-12-31',
    createdAt: new Date().toISOString(),
    messages: {},
    calendarName: calendarName || null,
    passwordHash: password ? simpleHash(password) : null
  };
  
  const calendars = mockGetAllCalendars();
  calendars[calendarId] = calendarData;
  localStorage.setItem(CALENDARS_STORAGE_KEY, JSON.stringify(calendars));
  
  return calendarId;
}

/**
 * 목업: 캘린더 이름 중복 체크
 */
export function mockCheckCalendarNameExists(calendarName) {
  const calendars = mockGetAllCalendars();
  const trimmedName = calendarName.trim();
  
  for (const calendar of Object.values(calendars)) {
    if ((calendar.calendarName || '').trim() === trimmedName) {
      return true; // 중복됨
    }
  }
  
  return false;
}

/**
 * 목업: 이름과 비밀번호로 캘린더 찾기
 */
export function mockFindCalendarByName(calendarName, password) {
  if (!calendarName || !password) {
    return null;
  }
  
  const calendars = mockGetAllCalendars();
  const passwordHash = simpleHash(password);
  const trimmedName = calendarName.trim();
  
  for (const [calendarId, calendar] of Object.entries(calendars)) {
    const storedName = calendar.calendarName || '';
    const storedHash = calendar.passwordHash || '';
    const nameMatch = storedName.trim() === trimmedName;
    const hashMatch = storedHash === passwordHash;
    
    if (nameMatch && hashMatch) {
      return { id: calendarId, ...calendar };
    }
  }
  
  return null;
}

/**
 * 목업: 캘린더 조회
 */
export function mockGetCalendar(calendarId) {
  const calendars = mockGetAllCalendars();
  const calendar = calendars[calendarId];
  
  if (calendar) {
    // createdAt을 Date 객체로 변환하지 않고 그대로 반환
    return {
      ...calendar,
      createdAt: calendar.createdAt || new Date().toISOString()
    };
  }
  
  return null;
}

/**
 * 목업: 메시지 저장
 */
export function mockSaveMessage(calendarId, date, message) {
  const calendars = mockGetAllCalendars();
  const calendar = calendars[calendarId];
  
  if (!calendar) {
    throw new Error('캘린더를 찾을 수 없습니다.');
  }
  
  if (!calendar.messages) {
    calendar.messages = {};
  }
  
  if (!calendar.messages[date]) {
    calendar.messages[date] = [];
  }
  
  calendar.messages[date].push({
    text: message,
    createdAt: new Date().toISOString()
  });
  
  calendars[calendarId] = calendar;
  localStorage.setItem(CALENDARS_STORAGE_KEY, JSON.stringify(calendars));
  
  return true;
}

/**
 * 모든 캘린더 가져오기 (내부 함수)
 */
function mockGetAllCalendars() {
  try {
    const data = localStorage.getItem(CALENDARS_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('목업 캘린더 조회 실패:', error);
    return {};
  }
}

