/**
 * Rate Limiting 유틸리티
 * 클라이언트 측에서 API 호출 빈도 제한
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Rate Limit 체크
 * @param key Rate limit 키 (예: 'login', 'register')
 * @param maxAttempts 최대 시도 횟수
 * @param windowMs 시간 윈도우 (밀리초)
 * @returns 허용 여부
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15분
): boolean {
  if (typeof window === 'undefined') return true; // 서버 사이드에서는 항상 허용

  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    // 새로운 윈도우 시작
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (entry.count >= maxAttempts) {
    return false; // Rate limit 초과
  }

  entry.count++;
  return true;
}

/**
 * Rate Limit 리셋 (성공 시)
 * @param key Rate limit 키
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * 남은 시도 횟수 조회
 * @param key Rate limit 키
 * @param maxAttempts 최대 시도 횟수
 * @returns 남은 시도 횟수
 */
export function getRemainingAttempts(key: string, maxAttempts: number = 5): number {
  const entry = rateLimitStore.get(key);
  if (!entry) return maxAttempts;
  
  const now = Date.now();
  if (now > entry.resetTime) return maxAttempts;
  
  return Math.max(0, maxAttempts - entry.count);
}

/**
 * Rate Limit 해제까지 남은 시간 (초)
 * @param key Rate limit 키
 * @returns 남은 시간 (초), 0이면 제한 없음
 */
export function getTimeUntilReset(key: string): number {
  const entry = rateLimitStore.get(key);
  if (!entry) return 0;
  
  const now = Date.now();
  if (now > entry.resetTime) return 0;
  
  return Math.ceil((entry.resetTime - now) / 1000);
}

