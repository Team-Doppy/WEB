// URL 파라미터 검증 유틸리티

/**
 * username 유효성 검증
 * 영문자, 숫자, 언더스코어, 하이픈만 허용
 */
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  return usernameRegex.test(username);
}

/**
 * URL 파라미터에서 username 검증 및 정규화
 * @param username 검증할 username
 * @returns 검증된 username 또는 null
 */
export function validateUsername(username: string | undefined | null): string | null {
  if (!username) return null;
  return isValidUsername(username) ? username : null;
}

