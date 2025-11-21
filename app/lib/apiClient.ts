// 클라이언트 사이드 API 호출 유틸리티 (인증 토큰 처리 포함)

'use client';

import { Post } from '@/app/types/post.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * JWT 토큰에서 만료 시간 추출
 */
function getTokenExpiration(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000; // 초를 밀리초로 변환
  } catch (e) {
    return null;
  }
}

/**
 * 토큰이 곧 만료될지 확인 (5분 버퍼)
 */
function isTokenExpiringSoon(token: string): boolean {
  const expirationTime = getTokenExpiration(token);
  if (!expirationTime) return false;
  
  const now = Date.now();
  const bufferTime = 5 * 60 * 1000; // 5분 버퍼
  return (expirationTime - now) < bufferTime;
}

/**
 * 리프레시 토큰으로 새 토큰 발급
 */
async function refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string } | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return {
      token: data.data?.token || data.token,
      refreshToken: data.data?.refreshToken || data.refreshToken,
    };
  } catch (error) {
    console.error('토큰 갱신 실패:', error);
    return null;
  }
}

/**
 * 클라이언트 사이드 API 요청 (토큰 자동 갱신 포함)
 */
export async function clientApiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T | null> {
  if (!API_BASE_URL) {
    console.warn('API_BASE_URL이 설정되지 않았습니다.');
    return null;
  }

  // 토큰 가져오기
  const accessToken = typeof window !== 'undefined' 
    ? localStorage.getItem('accessToken') 
    : null;
  const refreshTokenValue = typeof window !== 'undefined'
    ? localStorage.getItem('refreshToken')
    : null;

  // 토큰이 곧 만료되면 갱신
  let finalToken = accessToken;
  if (accessToken && refreshTokenValue && isTokenExpiringSoon(accessToken)) {
    const newTokens = await refreshToken(refreshTokenValue);
    if (newTokens) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', newTokens.token);
        localStorage.setItem('refreshToken', newTokens.refreshToken);
      }
      finalToken = newTokens.token;
    }
  }

  try {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    // 토큰이 있으면 Authorization 헤더 추가
    if (finalToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${finalToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // 서버가 자동으로 토큰을 갱신한 경우 (백업)
    const newAccessToken = response.headers.get('x-new-access-token');
    const newRefreshToken = response.headers.get('x-new-refresh-token');
    if (newAccessToken && newRefreshToken && typeof window !== 'undefined') {
      localStorage.setItem('accessToken', newAccessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
    }

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      if (response.status === 401 || response.status === 403) {
        // 인증 오류 시 로그인 페이지로 리다이렉트
        if (typeof window !== 'undefined') {
          // 로그인 페이지로 이동 (필요시 구현)
          // window.location.href = '/login';
        }
        return null;
      }
      throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      console.error(`API 요청 오류 (${endpoint}):`, error.message);
    } else {
      console.error(`API 요청 오류 (${endpoint}):`, error);
    }
    return null;
  }
}

