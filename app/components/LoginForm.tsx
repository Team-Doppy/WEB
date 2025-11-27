'use client';

import React, { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { PasswordBreachModal } from './PasswordBreachModal';
import { AppStoreBadge } from './AppStoreBadge';
import { GooglePlayBadge } from './GooglePlayBadge';

interface LoginFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
  showRegister?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onSuccess, 
  onClose,
  showRegister = false 
}) => {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(!showRegister);
  const [showAppInstall, setShowAppInstall] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordBreachModal, setShowPasswordBreachModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await login({ username, password });
      // 비밀번호 유출 경고가 있는 경우 모달 표시 (하지만 로그인은 성공)
      if (response.passwordBreached || response.requirePasswordChange) {
        setShowPasswordBreachModal(true);
      }
      // 로그인 성공 (경고가 있어도 로그인은 완료)
      // AuthContext에서 상태가 업데이트될 시간을 줌
      await new Promise(resolve => setTimeout(resolve, 300));
      onSuccess?.();
    } catch (err) {
      // 로그인 실패 시 통일된 메시지 표시
      setError('ID나 비밀번호가 틀렸습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-12">
        <div>
          <h2 className="text-4xl font-bold text-white mb-2">
            {showAppInstall ? '앱에서 회원가입을 진행해주세요' : '로그인'}
          </h2>
          <p className="text-gray-400 text-base">
            {showAppInstall 
              ? '앱을 설치하고 회원가입을 진행해주세요' 
              : '계정에 로그인하여 계속하세요'}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {showAppInstall ? (
        <div className="py-6">
          {/* 앱 다운로드 버튼들 */}
          <div className="flex flex-col items-center gap-0">
            {/* App Store 다운로드 버튼 */}
            <div className="flex flex-col items-center">
              <a 
                href={process.env.NEXT_PUBLIC_APP_STORE_URL || "https://apps.apple.com/kr/app/doppy/id6755365538"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block"
              >
                <AppStoreBadge />
              </a>
              <p className="text-gray-400 text-xs mt-1">Apple에서 다운로드</p>
            </div>
            
            {/* Google Play 다운로드 버튼 */}
            <div className="flex flex-col items-center -mt-2">
              <a 
                href={process.env.NEXT_PUBLIC_GOOGLE_PLAY_URL || "https://play.google.com/store/apps/details?id=com.doppy.app"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block"
              >
                <GooglePlayBadge />
              </a>
              <p className="text-gray-400 text-xs mt-1">Google Play에서 다운로드</p>
            </div>
          </div>
        </div>
      ) : (
      <form onSubmit={handleSubmit} className="space-y-8" autoComplete="off" data-form-type="other">
        {/* 사용자명 */}
        <div>
          <label htmlFor="username" className="block text-base font-medium text-gray-300 mb-3">
            사용자명
          </label>
          <div className="relative">
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => {
                const value = e.target.value;
                // 입력값 검증: 영문, 숫자, 언더스코어, 하이픈만 허용, 최대 20자
                const filteredValue = value.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20);
                setUsername(filteredValue);
                setError(null);
              }}
              onInput={(e) => {
                // onInput도 동일하게 처리하여 즉각적인 반응 보장
                const value = e.currentTarget.value;
                const filteredValue = value.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20);
                if (filteredValue !== value) {
                  e.currentTarget.value = filteredValue;
                }
                setUsername(filteredValue);
                setError(null);
              }}
              className="w-full px-4 py-3.5 bg-[#1a1a1a] text-white text-base rounded-xl border border-white/20 focus:outline-none focus:border-white/40 transition-all placeholder:text-gray-500"
              placeholder="사용자명을 입력하세요"
              required
              minLength={3}
              maxLength={20}
              pattern="^[a-zA-Z0-9_-]+$"
              disabled={isLoading}
              autoComplete="username"
              data-lpignore="true"
              data-1p-ignore="true"
            />
          </div>
        </div>

        {/* 비밀번호 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label htmlFor="password" className="block text-base font-medium text-gray-300">
              비밀번호
            </label>
            {isLogin && (
              <button
                type="button"
                onClick={() => {}}
                className="text-base text-gray-400 hover:text-white transition-colors"
              >
                비밀번호 찾기
              </button>
            )}
          </div>
          <div className="relative">
            <input
              id="password"
              name="password-field"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              className="w-full px-4 py-3.5 bg-[#1a1a1a] text-white text-base rounded-xl border border-white/20 focus:outline-none focus:border-white/40 transition-all placeholder:text-gray-500 pr-12"
              placeholder="비밀번호를 입력하세요"
              required
              minLength={8}
              disabled={isLoading}
              autoComplete="new-password"
              data-lpignore="true"
              data-form-type="other"
              data-1p-ignore="true"
            />  <div className="flex items-center justify-between mb-20">
                </div>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>


        {/* 에러 메시지 */}
        {error && (
          <p className="text-red-500 text-base">{error}</p>
        )}

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-6 py-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white text-lg"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              로그인
            </span>
          ) : (
            '로그인'
          )}
        </button>

        {/* 로그인/회원가입 전환 */}
        <div className="text-center pt-4 border-t border-white/20">
          <p className="text-gray-400 text-sm">
            계정이 없으신가요?{' '}
            <button
              type="button"
              onClick={() => {
                setShowAppInstall(true);
                setError(null);
                setUsername('');
                setPassword('');
              }}
              className="text-white font-medium hover:underline transition-colors"
            >
              회원가입
            </button>
          </p>
        </div>
      </form>
      )}
      
      {/* 앱 설치 화면에서 로그인으로 돌아가기 */}
      {showAppInstall && (
        <div className="text-center pt-4 border-t border-white/20 mt-8">
          <p className="text-gray-400 text-sm">
            이미 계정이 있으신가요?{' '}
            <button
              type="button"
              onClick={() => {
                setShowAppInstall(false);
                setError(null);
              }}
              className="text-white font-medium hover:underline transition-colors"
            >
              로그인
            </button>
          </p>
        </div>
      )}

      {/* 비밀번호 유출 경고 모달 */}
      {showPasswordBreachModal && (
        <PasswordBreachModal
          onConfirm={() => {
            setShowPasswordBreachModal(false);
            onSuccess?.();
            // TODO: 비밀번호 변경 페이지로 이동하거나 모달 표시
          }}
        />
      )}
    </div>
  );
};

