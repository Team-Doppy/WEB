/**
 * 서버 컴포넌트용 쿠키 유틸리티
 * Next.js의 cookies() 함수를 사용하여 서버 사이드에서 쿠키 읽기
 */

import { cookies } from 'next/headers';

/**
 * 서버 컴포넌트에서 쿠키 조회
 * @param name 쿠키 이름
 * @returns 쿠키 값 또는 null
 */
export async function getServerCookie(name: string): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(name);
    return cookie?.value || null;
  } catch (error) {
    // 쿠키를 읽을 수 없는 경우 (클라이언트 사이드 등)
    return null;
  }
}

/**
 * 서버 컴포넌트에서 Access Token 조회
 * @returns Access Token 또는 null
 */
export async function getServerAccessToken(): Promise<string | null> {
  return getServerCookie('accessToken');
}

/**
 * 서버 컴포넌트에서 Refresh Token 조회
 * @returns Refresh Token 또는 null
 */
export async function getServerRefreshToken(): Promise<string | null> {
  return getServerCookie('refreshToken');
}

