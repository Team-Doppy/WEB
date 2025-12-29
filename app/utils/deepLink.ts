/**
 * 딥링크 및 앱 열기 유틸리티
 */

import { isIOS, isAndroid } from './device';

const APP_STORE_URL = 'https://apps.apple.com/app/id6755365538';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.doppy.app';

/**
 * 딥링크로 앱 열기 (자동 이동 없음)
 * @param deepLink - 딥링크 URL (예: doppy://post/123)
 */
export function openDeepLink(deepLink: string): void {
  if (typeof window === 'undefined') return;

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
    } 
    // 기타: 직접 딥링크 시도
    else {
      window.location.href = deepLink;
    }
  } catch (error) {
    console.error('딥링크 열기 실패:', error);
  }
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

