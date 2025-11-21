'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as loginApi, logout as logoutApi, refreshToken, isAuthenticated, getAccessToken, getMe, MeResponse } from '@/app/lib/authApi';
import { LoginRequest, LoginResponse } from '@/app/lib/authApi';
import { decodeJWT, getUsernameFromToken, isTokenExpired } from '@/app/utils/jwt';

// getUsernameFromToken을 import했으므로 사용 가능

interface UserInfo {
  username: string;
  profileImageUrl: string | null;
  alias?: string;
  region?: string;
}

interface AuthContextType {
  user: UserInfo | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 사용자 정보 가져오기 (getMe API 사용)
  const fetchUserInfo = useCallback(async (): Promise<UserInfo | null> => {
    try {
      const meData = await getMe();
      if (meData) {
        return {
          username: meData.username,
          profileImageUrl: meData.profileImageUrl,
          alias: meData.alias,
          region: meData.region,
        };
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      return null;
    }
  }, []);

  // 초기 인증 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAccessToken();
      
      if (token) {
        try {
          // 토큰 만료 확인
          if (isTokenExpired(token)) {
            // 만료된 토큰이면 갱신 시도
            try {
              await refreshToken();
              // 갱신 후 사용자 정보 가져오기
              const userInfo = await fetchUserInfo();
              if (userInfo) {
                setUser(userInfo);
              } else {
                // getMe 실패 시 토큰에서 기본 정보 추출
                const newToken = getAccessToken();
                const username = newToken ? getUsernameFromToken(newToken) : null;
                const decoded = newToken ? decodeJWT(newToken) : null;
                if (username) {
                  setUser({
                    username,
                    profileImageUrl: null,
                    region: decoded?.region || 'KR',
                  });
                } else {
                  setUser(null);
                }
              }
            } catch (error) {
              // 갱신 실패 시 로그아웃 상태로 설정
              console.error('Token refresh failed:', error);
              setUser(null);
            }
          } else {
            // 유효한 토큰이면 사용자 정보 가져오기
            const userInfo = await fetchUserInfo();
            if (userInfo) {
              setUser(userInfo);
            } else {
              // getMe 실패 시 토큰에서 기본 정보 추출
              const username = getUsernameFromToken(token);
              const decoded = decodeJWT(token);
              if (username) {
                setUser({
                  username,
                  profileImageUrl: null,
                  region: decoded?.region || 'KR',
                });
              } else {
                setUser(null);
              }
            }
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          // 에러 발생 시에도 토큰이 있으면 기본 정보라도 유지
          const username = getUsernameFromToken(token);
          const decoded = decodeJWT(token);
          if (username) {
            setUser({
              username,
              profileImageUrl: null,
              region: decoded?.region || 'KR',
            });
          } else {
            setUser(null);
          }
        }
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [fetchUserInfo]);

  const login = useCallback(async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await loginApi(credentials);
      // 로그인 성공 후 사용자 정보 가져오기
      try {
        const userInfo = await fetchUserInfo();
        if (userInfo) {
          setUser(userInfo);
        } else {
          // getMe가 실패하면 토큰에서 기본 정보라도 설정
          const username = getUsernameFromToken(response.token);
          if (username) {
            setUser({
              username,
              profileImageUrl: null,
              region: response.region,
            });
          }
        }
      } catch (userInfoError) {
        console.error('Failed to fetch user info after login:', userInfoError);
        // 사용자 정보 가져오기 실패해도 로그인은 성공으로 처리
        const username = getUsernameFromToken(response.token);
        if (username) {
          setUser({
            username,
            profileImageUrl: null,
            region: response.region,
          });
        }
      }
      return response;
    } catch (error) {
      throw error;
    }
  }, [fetchUserInfo]);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
      setUser(null);
    } catch (error) {
      // 로그아웃 실패해도 상태는 초기화
      setUser(null);
      throw error;
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    try {
      await refreshToken();
      // 토큰 갱신 후 사용자 정보 가져오기
      const userInfo = await fetchUserInfo();
      setUser(userInfo);
    } catch (error) {
      setUser(null);
      throw error;
    }
  }, [fetchUserInfo]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

