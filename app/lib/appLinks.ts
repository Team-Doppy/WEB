/**
 * Universal Links / App Links 유틸리티
 * iOS Universal Links와 Android App Links를 처리합니다.
 */

const BASE_URL = 'https://doppy.app';

/**
 * 앱에서 특정 경로를 열기 위한 함수
 * @param path - 앱에서 열 경로 (예: '/profile/username')
 */
export function openInApp(path: string = ''): void {
  const fullUrl = `${BASE_URL}${path}`;
  const userAgent = navigator.userAgent;

  // iOS: Universal Links는 자동으로 작동
  if (/iPhone|iPad|iPod/.test(userAgent)) {
    // Universal Links는 자동으로 앱을 열지만, 명시적으로 시도
    window.location.href = fullUrl;
  }
  // Android: Intent URL 사용
  else if (/Android/.test(userAgent)) {
    const intentUrl = `intent://${window.location.host}${path}#Intent;scheme=https;package=com.doppy.app;S.browser_fallback_url=${encodeURIComponent(fullUrl)};end`;
    
    // Intent URL로 앱 열기 시도
    window.location.href = intentUrl;
    
    // 앱이 설치되어 있지 않으면 2초 후 Play Store로 이동
    setTimeout(() => {
      if (document.hasFocus()) {
        // 여전히 웹 페이지에 있으면 앱이 설치되지 않은 것
        window.location.href = 'https://play.google.com/store/apps/details?id=com.doppy.app';
      }
    }, 2000);
  }
  // 기타: 일반 링크
  else {
    window.location.href = fullUrl;
  }
}

/**
 * 앱이 설치되어 있는지 확인 (선택적)
 * 정확한 확인은 어렵지만, 일부 힌트를 제공할 수 있습니다.
 */
export function isAppInstalled(): boolean {
  const userAgent = navigator.userAgent;
  
  // iOS에서 Universal Links가 작동하면 앱이 설치된 것으로 간주
  if (/iPhone|iPad|iPod/.test(userAgent)) {
    return true; // Universal Links가 자동으로 처리
  }
  
  // Android는 Intent URL을 시도하고 결과를 확인
  return false; // 정확한 확인은 어려움
}

