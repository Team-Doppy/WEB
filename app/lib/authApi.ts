/**
 * 인증 관련 API 클라이언트
 */

import { getCookie, setCookie, clearAuthCookies } from '@/app/utils/cookies';
import { checkRateLimit, resetRateLimit, getRemainingAttempts, getTimeUntilReset } from '@/app/utils/rateLimit';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface LoginRequest {
  username: string;
  password: string;
  region?: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  type: string;
  username: string;
  region: string;
  passwordBreached?: boolean; // 비밀번호가 유출된 경우 true
  requirePasswordChange?: boolean; // 비밀번호 변경이 필요한 경우 true
}

export interface RegisterRequest {
  username: string;
  password: string;
  role?: string;
  alias?: string;
  fcmToken?: string | null;
  deviceId?: string | null;
  deviceType?: string | null;
}

export interface RegisterResponse {
  id: number;
  username: string;
  alias: string;
  role: string;
  createdAt: string;
  region: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse extends LoginResponse {}

export interface LogoutRequest {
  refreshToken: string;
}

export interface CheckUsernameResponse {
  available: boolean;
  message: string;
}

export interface ApiError {
  error: string;
  message: string;
}

/**
 * 로그인
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  // Rate limiting 체크
  const rateLimitKey = `login:${credentials.username}`;
  if (!checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)) {
    const remainingTime = getTimeUntilReset(rateLimitKey);
    throw new Error(`너무 많은 로그인 시도가 있었습니다. ${Math.ceil(remainingTime / 60)}분 후 다시 시도해주세요.`);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/web/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password,
        region: credentials.region || 'KR',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // 로그인 실패 시에도 rate limit은 유지
      throw new Error(data.message || '로그인에 실패했습니다.');
    }

    // 로그인 성공 시 rate limit 리셋
    resetRateLimit(rateLimitKey);

    // 토큰을 쿠키에 저장
    // Access Token: 1시간 (1/24일), Refresh Token: 7일
    setCookie('accessToken', data.token, 1/24); // 1시간
    setCookie('refreshToken', data.refreshToken, 7); // 7일

    return data;
  } catch (error) {
    // 네트워크 오류 등은 rate limit에 포함하지 않음
    if (error instanceof Error && error.message.includes('너무 많은')) {
      throw error;
    }
    throw error;
  }
}

/**
 * 회원가입
 */
export async function register(userData: RegisterRequest): Promise<RegisterResponse> {
  // Rate limiting 체크
  const rateLimitKey = 'register:global';
  if (!checkRateLimit(rateLimitKey, 3, 60 * 60 * 1000)) { // 1시간에 3회
    const remainingTime = getTimeUntilReset(rateLimitKey);
    throw new Error(`너무 많은 회원가입 시도가 있었습니다. ${Math.ceil(remainingTime / 60)}분 후 다시 시도해주세요.`);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/web/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: userData.username,
        password: userData.password,
        role: userData.role || 'USER',
        alias: userData.alias || 'alias',
        fcmToken: userData.fcmToken || null,
        deviceId: userData.deviceId || null,
        deviceType: userData.deviceType || null,
      }),
    });

  const data = await response.json();

  if (!response.ok) {
    // 보안을 위해 상세한 에러 메시지 노출 최소화
    const errorCode = data.error || '';
    let errorMessage = '회원가입에 실패했습니다.';
    
    if (errorCode === 'INVALID_INPUT') {
      errorMessage = data.message || '입력 정보가 올바르지 않습니다.';
    } else if (errorCode === 'DUPLICATE_USERNAME') {
      errorMessage = '이미 사용 중인 사용자명입니다.';
    } else if (data.message && typeof data.message === 'string') {
      errorMessage = data.message;
    }
    
    throw new Error(errorMessage);
  }

    // 회원가입 성공 시 rate limit 리셋
    resetRateLimit(rateLimitKey);

    return data;
  } catch (error) {
    if (error instanceof Error && error.message.includes('너무 많은')) {
      throw error;
    }
    throw error;
  }
}

/**
 * 사용자명 중복 확인
 */
export async function checkUsername(username: string): Promise<CheckUsernameResponse> {
  const response = await fetch(`${API_BASE_URL}/web/auth/check-username/${encodeURIComponent(username)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || '사용자명 확인에 실패했습니다.');
  }

  return data;
}

// Refresh Token 재사용 방지를 위한 플래그
let isRefreshing = false;
let refreshPromise: Promise<RefreshResponse> | null = null;

/**
 * 토큰 갱신
 */
export async function refreshToken(): Promise<RefreshResponse> {
  // 이미 갱신 중이면 기존 Promise 반환 (중복 요청 방지)
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  const refreshTokenValue = getCookie('refreshToken');

  if (!refreshTokenValue) {
    clearAuthCookies();
    throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/web/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: refreshTokenValue,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // 토큰 갱신 실패 시 쿠키 삭제
        clearAuthCookies();
        
        // 보안을 위해 상세한 에러 메시지 노출 최소화
        const errorCode = data.error || '';
        let errorMessage = '인증이 만료되었습니다. 다시 로그인해주세요.';
        
        if (errorCode === 'INVALID_REFRESH_TOKEN') {
          errorMessage = '인증이 만료되었습니다. 다시 로그인해주세요.';
        } else if (data.message && typeof data.message === 'string') {
          errorMessage = data.message;
        }
        
        throw new Error(errorMessage);
      }

      // 새로운 토큰을 쿠키에 저장
      // Access Token: 1시간 (1/24일), Refresh Token: 7일
      setCookie('accessToken', data.token, 1/24); // 1시간
      setCookie('refreshToken', data.refreshToken, 7); // 7일

      return data;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * 로그아웃
 */
export async function logout(): Promise<void> {
  const refreshTokenValue = getCookie('refreshToken');

  if (refreshTokenValue) {
    try {
      await fetch(`${API_BASE_URL}/web/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: refreshTokenValue,
        }),
      });
    } catch (error) {
      // 로그아웃 실패해도 쿠키는 삭제
      console.error('Logout request failed:', error);
    }
  }

  // 쿠키 삭제
  clearAuthCookies();
}

/**
 * 현재 Access Token 조회
 */
export function getAccessToken(): string | null {
  return getCookie('accessToken');
}

/**
 * 현재 Refresh Token 조회
 */
export function getRefreshToken(): string | null {
  return getCookie('refreshToken');
}

/**
 * 인증 상태 확인
 */
export function isAuthenticated(): boolean {
  return getAccessToken() !== null;
}

/**
 * 현재 로그인한 사용자 정보 조회
 * @returns 사용자 정보 또는 null
 */
export interface MeResponse {
  id: number;
  username: string;
  alias: string;
  role: string;
  profileImageUrl: string | null;
  region: string;
  createdAt: string;
}

export async function getMe(): Promise<MeResponse | null> {
  const token = getAccessToken();
  
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/web/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // 인증 실패 시 쿠키 삭제
        clearAuthCookies();
        return null;
      }
      throw new Error(`사용자 정보 조회 실패: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('getMe error:', error);
    return null;
  }
}

