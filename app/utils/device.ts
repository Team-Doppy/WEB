/**
 * 디바이스 및 브라우저 감지 유틸리티
 */

/**
 * 모바일 디바이스인지 확인
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
    (window.innerWidth <= 768);
}

/**
 * 인앱 브라우저인지 확인 (카톡, 인스타, 페이스북 등)
 */
export function isInAppBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  
  // 카카오톡
  if (userAgent.includes('kakaotalk')) return true;
  
  // 인스타그램
  if (userAgent.includes('instagram')) return true;
  
  // 페이스북
  if (userAgent.includes('fban') || userAgent.includes('fbav')) return true;
  
  // 네이버
  if (userAgent.includes('naver')) return true;
  
  // 라인
  if (userAgent.includes('line')) return true;
  
  // 웹뷰 (일반적인 웹뷰 감지)
  if (userAgent.includes('wv')) return true;
  
  return false;
}

/**
 * iOS인지 확인
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/**
 * Android인지 확인
 */
export function isAndroid(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
}

