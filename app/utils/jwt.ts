/**
 * JWT 토큰 유틸리티 함수
 * JWT 토큰을 디코딩하여 사용자 정보 추출
 */

/**
 * JWT 토큰 디코딩 (Base64 URL 디코딩)
 * @param token JWT 토큰
 * @returns 디코딩된 페이로드 또는 null
 */
export function decodeJWT(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // 페이로드 부분 디코딩
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('JWT 디코딩 실패:', error);
    return null;
  }
}

/**
 * JWT 토큰에서 사용자명 추출
 * @param token JWT 토큰
 * @returns 사용자명 또는 null
 */
export function getUsernameFromToken(token: string): string | null {
  const decoded = decodeJWT(token);
  if (!decoded) {
    return null;
  }

  // JWT 페이로드에서 username 또는 sub 필드 추출
  return decoded.username || decoded.sub || null;
}

/**
 * JWT 토큰 만료 확인
 * @param token JWT 토큰
 * @returns 만료 여부 (true: 만료됨, false: 유효함)
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  // exp는 Unix timestamp (초 단위)
  const expirationTime = decoded.exp * 1000; // 밀리초로 변환
  const currentTime = Date.now();

  return currentTime >= expirationTime;
}

