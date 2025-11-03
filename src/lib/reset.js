/**
 * 모든 캘린더 데이터 초기화 (테스트용)
 */
export function resetAllData() {
  // 캘린더 링크 삭제
  localStorage.removeItem('advent_calendar_links');
  
  // 목업 캘린더 데이터 삭제
  localStorage.removeItem('mock_calendars');
  
  console.log('✅ 모든 캘린더 데이터가 초기화되었습니다!');
  console.log('페이지를 새로고침해주세요.');
  
  return true;
}


