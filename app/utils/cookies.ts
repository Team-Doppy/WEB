/**
 * 쿠키 유틸리티 함수
 * JWT 토큰을 쿠키에 안전하게 저장/조회/삭제
 */

/**
 * 쿠키 값 인코딩 (XSS 방지)
 * @param value 쿠키 값
 * @returns 인코딩된 값
 */
function encodeCookieValue(value: string): string {
  // 특수문자 이스케이프 처리
  return encodeURIComponent(value);
}

/**
 * 쿠키 설정
 * @param name 쿠키 이름
 * @param value 쿠키 값
 * @param days 만료일 (기본값: 7일, 1시간은 1/24)
 */
export function setCookie(name: string, value: string, days: number = 7): void {
  if (typeof window === 'undefined') return;
  
  // 쿠키 이름과 값 검증
  if (!name || !/^[a-zA-Z0-9_-]+$/.test(name)) {
    console.error('Invalid cookie name');
    return;
  }
  
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  
  // 쿠키 값 인코딩 (XSS 방지)
  const encodedValue = encodeCookieValue(value);
  
  // HttpOnly는 JavaScript에서 설정할 수 없으므로, SameSite와 Secure 옵션 사용
  // 프로덕션에서는 서버에서 HttpOnly 쿠키로 설정하는 것이 더 안전합니다
  // SameSite=Lax로 설정하여 CSRF 공격 방지 (Strict는 너무 엄격할 수 있음)
  const isSecure = window.location.protocol === 'https:' || process.env.NODE_ENV === 'production';
  document.cookie = `${name}=${encodedValue};expires=${expires.toUTCString()};path=/;SameSite=Lax${isSecure ? ';Secure' : ''}`;
}

/**
 * 쿠키 조회
 * @param name 쿠키 이름
 * @returns 쿠키 값 또는 null
 */
export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null;
  
  // 쿠키 이름 검증
  if (!name || !/^[a-zA-Z0-9_-]+$/.test(name)) {
    console.error('Invalid cookie name');
    return null;
  }
  
  const nameEQ = encodeURIComponent(name) + '=';
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      const value = c.substring(nameEQ.length, c.length);
      try {
        // 디코딩 시도
        return decodeURIComponent(value);
      } catch (e) {
        // 디코딩 실패 시 원본 반환 (이미 디코딩된 경우)
        return value;
      }
    }
  }
  
  return null;
}

/**
 * 쿠키 삭제
 * @param name 쿠키 이름
 */
export function deleteCookie(name: string): void {
  if (typeof window === 'undefined') return;
  
  // 쿠키 이름 검증
  if (!name || !/^[a-zA-Z0-9_-]+$/.test(name)) {
    console.error('Invalid cookie name');
    return;
  }
  
  const isSecure = window.location.protocol === 'https:' || process.env.NODE_ENV === 'production';
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax${isSecure ? ';Secure' : ''}`;
}

/**
 * 모든 인증 관련 쿠키 삭제
 */
export function clearAuthCookies(): void {
  deleteCookie('accessToken');
  deleteCookie('refreshToken');
}

