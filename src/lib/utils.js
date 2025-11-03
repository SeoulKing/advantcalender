/**
 * 간단한 문자열 해시 함수 (비밀번호 해싱용)
 * 실제 운영에서는 더 강력한 해싱 알고리즘 사용 권장
 */
export function simpleHash(str) {
  if (!str) return '';
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // 음수 처리: 절댓값으로 변환
  const positiveHash = Math.abs(hash);
  return positiveHash.toString(36);
}

/**
 * 비밀번호 검증
 */
export function verifyPassword(inputPassword, storedHash) {
  return simpleHash(inputPassword) === storedHash;
}

