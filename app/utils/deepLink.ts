/**
 * 딥링크 및 앱 열기 유틸리티
 */

import { isIOS, isAndroid } from './device';

const APP_STORE_URL = 'https://apps.apple.com/app/id6755365538';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.doppy.app';

/**
 * 딥링크로 앱 열기
 * @param deepLink - 딥링크 URL (예: doppy://post/123)
 * @param fallbackUrl - 폴백 URL (앱이 없을 때 이동할 URL)
 */
export function openDeepLink(deepLink: string, fallbackUrl?: string): void {
  if (typeof window === 'undefined') return;

  // 페이지가 포커스를 잃었는지 추적
  let pageHidden = false;
  const visibilityChangeHandler = () => {
    if (document.hidden) {
      pageHidden = true;
    }
  };
  
  document.addEventListener('visibilitychange', visibilityChangeHandler);
  window.addEventListener('blur', () => {
    pageHidden = true;
  });

  // 딥링크 시도
  try {
    // iOS: location.href 사용
    if (isIOS()) {
      window.location.href = deepLink;
    } 
    // Android: Intent URL 또는 직접 딥링크
    else if (isAndroid()) {
      // 먼저 직접 딥링크 시도
      window.location.href = deepLink;
      
      // Intent URL도 시도 (폴백)
      setTimeout(() => {
        const path = deepLink.replace('doppy://', '');
        const intentUrl = `intent://${path}#Intent;scheme=doppy;package=com.doppy.app;end`;
        window.location.href = intentUrl;
      }, 100);
    } 
    // 기타: 직접 딥링크 시도
    else {
      window.location.href = deepLink;
    }
  } catch (error) {
    console.error('딥링크 열기 실패:', error);
  }

  // 앱이 열렸는지 확인 (약 2.5초 후)
  setTimeout(() => {
    document.removeEventListener('visibilitychange', visibilityChangeHandler);
    
    // 페이지가 숨겨지지 않았으면 앱이 열리지 않은 것으로 간주
    if (!pageHidden && document.hasFocus()) {
      if (fallbackUrl) {
        window.location.href = fallbackUrl;
      } else {
        // 기본 폴백: 스토어로 이동
        if (isIOS()) {
          window.location.href = APP_STORE_URL;
        } else if (isAndroid()) {
          window.location.href = PLAY_STORE_URL;
        }
      }
    }
  }, 2500);
}

/**
 * 포스트 딥링크 열기
 * @param postId - 포스트 ID
 */
export function openPostInApp(postId: string | number): void {
  const deepLink = `doppy://post/${postId}`;
  openDeepLink(deepLink);
}

/**
 * 프로필 딥링크 열기
 * @param username - 사용자명
 */
export function openProfileInApp(username: string): void {
  const deepLink = `doppy://profile/${username}`;
  openDeepLink(deepLink);
}

/**
 * 스토어로 이동
 */
export function openStore(): void {
  if (typeof window === 'undefined') return;
  
  if (isIOS()) {
    window.location.href = APP_STORE_URL;
  } else if (isAndroid()) {
    window.location.href = PLAY_STORE_URL;
  }
}

