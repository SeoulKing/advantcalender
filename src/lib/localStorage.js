const CALENDAR_LINKS_KEY = 'advent_calendar_links';

/**
 * localStorage에 캘린더 링크 저장
 */
export function saveCalendarLink(calendarId, title = null) {
  const links = getCalendarLinks();
  
  // 기존 캘린더 찾기
  const existingIndex = links.findIndex(link => link.id === calendarId);
  
  if (existingIndex >= 0) {
    // 이미 있는 캘린더면 배열에서 제거
    const existingCalendar = links.splice(existingIndex, 1)[0];
    
    // title 업데이트
    if (title) {
      existingCalendar.title = title;
    }
    // updatedAt 갱신
    existingCalendar.updatedAt = new Date().toISOString();
    
    // 맨 앞에 추가 (최신순으로 표시되도록)
    links.unshift(existingCalendar);
    localStorage.setItem(CALENDAR_LINKS_KEY, JSON.stringify(links));
  } else {
    // 새로운 캘린더 추가 (맨 앞에)
    const newCalendar = {
      id: calendarId,
      title: title || `캘린더 ${calendarId.slice(0, 8)}`,
      createdAt: new Date().toISOString()
    };
    links.unshift(newCalendar);
    localStorage.setItem(CALENDAR_LINKS_KEY, JSON.stringify(links));
  }
}

/**
 * localStorage에서 캘린더 링크 목록 조회
 */
export function getCalendarLinks() {
  try {
    const data = localStorage.getItem(CALENDAR_LINKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('캘린더 링크 조회 실패:', error);
    return [];
  }
}

/**
 * localStorage에서 캘린더 링크 삭제
 */
export function removeCalendarLink(calendarId) {
  const links = getCalendarLinks();
  const filtered = links.filter(link => link.id !== calendarId);
  localStorage.setItem(CALENDAR_LINKS_KEY, JSON.stringify(filtered));
}

/**
 * 개인 캘린더 링크 URL 생성 (메시지 확인용)
 */
export function generateCalendarLink(calendarId) {
  return `${window.location.origin}/calendar/${calendarId}`;
}

/**
 * 게스트 링크 URL 생성 (메시지 작성용 - 공개)
 */
export function generateGuestLink(calendarId) {
  return `${window.location.origin}/guest/${calendarId}`;
}

