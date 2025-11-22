'use client';

import React, { useState, useRef } from 'react';
import { ProfileImage } from './ProfileImage';
import { updateProfileInfo, uploadProfileImage, deleteProfileImage } from '@/app/lib/clientApi';
import { useAuth } from '@/app/contexts/AuthContext';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData: {
    username: string;
    alias: string;
    profileImageUrl: string | null;
    selfIntroduction: string | null;
    links: string[];
    linkTitles: Record<string, string>;
  };
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const { refreshAuth } = useAuth();
  const [alias, setAlias] = useState(initialData.alias || '');
  const [selfIntroduction, setSelfIntroduction] = useState(initialData.selfIntroduction || '');
  const [links, setLinks] = useState<string[]>(initialData.links || []);
  const [linkTitles, setLinkTitles] = useState<Record<string, string>>(initialData.linkTitles || {});
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(initialData.profileImageUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 모달이 열릴 때 초기 데이터로 리셋
  React.useEffect(() => {
    if (isOpen) {
      setAlias(initialData.alias || '');
      setSelfIntroduction(initialData.selfIntroduction || '');
      setLinks(initialData.links || []);
      setLinkTitles(initialData.linkTitles || {});
      setProfileImageUrl(initialData.profileImageUrl);
      setError(null);
    }
  }, [isOpen, initialData]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('이미지 크기는 5MB 이하여야 합니다.');
      return;
    }

    setUploadingImage(true);
    setError(null);

    try {
      const result = await uploadProfileImage(file);
      if (result && result.success && result.imageUrl) {
        setProfileImageUrl(result.imageUrl);
        // AuthContext의 사용자 정보도 업데이트
        await refreshAuth();
      } else {
        setError(result?.message || '이미지 업로드에 실패했습니다.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '이미지 업로드에 실패했습니다.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async () => {
    setUploadingImage(true);
    setError(null);

    try {
      const result = await deleteProfileImage();
      if (result && result.success) {
        setProfileImageUrl(null);
        await refreshAuth();
      } else {
        setError(result?.message || '이미지 삭제에 실패했습니다.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '이미지 삭제에 실패했습니다.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddLink = () => {
    setLinks([...links, '']);
  };

  const handleRemoveLink = (index: number) => {
    const removedLink = links[index];
    const newLinks = links.filter((_, i) => i !== index);
    setLinks(newLinks);
    
    // linkTitles에서도 제거
    if (removedLink && linkTitles[removedLink]) {
      const newLinkTitles = { ...linkTitles };
      delete newLinkTitles[removedLink];
      setLinkTitles(newLinkTitles);
    }
  };

  const handleLinkChange = (index: number, value: string) => {
    const oldLink = links[index];
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);

    // linkTitles 업데이트
    if (oldLink && linkTitles[oldLink]) {
      const newLinkTitles = { ...linkTitles };
      newLinkTitles[value] = newLinkTitles[oldLink];
      delete newLinkTitles[oldLink];
      setLinkTitles(newLinkTitles);
    }
  };

  const handleLinkTitleChange = (link: string, title: string) => {
    setLinkTitles({
      ...linkTitles,
      [link]: title,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // linkTitles의 모든 키가 links 배열에 포함되어야 함
      const validLinkTitles: Record<string, string> = {};
      Object.entries(linkTitles).forEach(([key, value]) => {
        if (links.includes(key) && key.trim() !== '') {
          validLinkTitles[key] = value;
        }
      });

      const filteredLinks = links.filter(link => link.trim() !== '');
      
      const requestData: {
        alias?: string;
        selfIntroduction?: string;
        links?: string[];
        linkTitles?: Record<string, string>;
      } = {};
      
      const trimmedAlias = alias.trim();
      if (trimmedAlias) {
        requestData.alias = trimmedAlias;
      }
      
      const trimmedIntro = selfIntroduction.trim();
      if (trimmedIntro) {
        requestData.selfIntroduction = trimmedIntro;
      }
      
      if (filteredLinks.length > 0) {
        requestData.links = filteredLinks;
      }
      
      if (Object.keys(validLinkTitles).length > 0) {
        requestData.linkTitles = validLinkTitles;
      }

      console.log('프로필 수정 요청 데이터:', requestData);
      
      const result = await updateProfileInfo(requestData);

      if (result && result.success) {
        await refreshAuth();
        onSuccess?.();
        onClose();
      } else {
        setError(result?.message || '프로필 수정에 실패했습니다.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '프로필 수정에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end lg:items-center justify-center p-4">
      <div className="bg-[#1a1a1a] rounded-t-3xl lg:rounded-2xl border-t lg:border border-white/20 shadow-2xl max-w-4xl w-full max-h-[90vh] lg:max-h-[95vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-white/10">
          <h2 className="text-xl lg:text-3xl font-bold text-white">프로필 편집</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 lg:p-8 space-y-6 lg:space-y-8">
          {/* 프로필 이미지 */}
          <div className="flex flex-col items-center gap-4 lg:gap-5">
            <ProfileImage
              src={profileImageUrl || undefined}
              alt={initialData.username}
              size="xl"
              className="!w-24 !h-24 lg:!w-36 lg:!h-36"
            />
            <div className="flex gap-2 lg:gap-3 w-full max-w-md">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="flex-1 px-4 lg:px-8 py-2.5 lg:py-3.5 bg-white/10 hover:bg-white/20 text-white text-sm lg:text-lg rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {uploadingImage ? '업로드 중...' : '이미지 변경'}
              </button>
              {profileImageUrl && (
                <button
                  type="button"
                  onClick={handleDeleteImage}
                  disabled={uploadingImage}
                  className="flex-1 px-4 lg:px-8 py-2.5 lg:py-3.5 bg-white/10 hover:bg-white/20 text-white text-sm lg:text-lg rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  이미지 삭제
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* 별칭 */}
          <div>
            <label htmlFor="alias" className="block text-sm lg:text-base font-medium text-gray-300 mb-2 lg:mb-3">
              별칭
            </label>
            <input
              id="alias"
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              className="w-full px-4 py-2.5 lg:py-3 bg-black/50 text-white text-sm lg:text-base rounded-xl border border-white/10 focus:outline-none focus:border-white/30 focus:bg-black/70 transition-all placeholder:text-gray-500"
              placeholder="별칭을 입력하세요"
              maxLength={50}
            />
          </div>

          {/* 자기소개 */}
          <div>
            <label htmlFor="selfIntroduction" className="block text-sm lg:text-base font-medium text-gray-300 mb-2 lg:mb-3">
              자기소개
            </label>
            <textarea
              id="selfIntroduction"
              value={selfIntroduction}
              onChange={(e) => setSelfIntroduction(e.target.value)}
              className="w-full px-4 py-2.5 lg:py-3 bg-black/50 text-white text-sm lg:text-base rounded-xl border border-white/10 focus:outline-none focus:border-white/30 focus:bg-black/70 transition-all resize-none placeholder:text-gray-500"
              placeholder="나의 설명"
              rows={5}
              maxLength={500}
            />
            <p className="text-gray-500 text-xs mt-2 text-right">
              {selfIntroduction.length}/500
            </p>
          </div>

          {/* 링크 */}
          <div>
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <label className="block text-sm lg:text-base font-medium text-gray-300">
                링크
              </label>
              <button
                type="button"
                onClick={handleAddLink}
                className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center hover:bg-gray-200 transition-all font-bold text-lg leading-none"
              >
                +
              </button>
            </div>
            <div className="space-y-2 lg:space-y-3">
              {links.map((link, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex gap-2 items-center">
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => handleLinkChange(index, e.target.value)}
                      className="flex-1 px-3 lg:px-4 py-2 lg:py-2.5 bg-black/50 text-white text-sm lg:text-base rounded-lg border border-white/10 focus:outline-none focus:border-white/30 focus:bg-black/70 transition-all placeholder:text-gray-500"
                      placeholder="https://..."
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(index)}
                      className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/10 rounded-lg transition-all flex-shrink-0"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {link && (
                    <input
                      type="text"
                      value={linkTitles[link] || ''}
                      onChange={(e) => handleLinkTitleChange(link, e.target.value)}
                      className="w-full px-3 lg:px-4 py-2 lg:py-2.5 bg-black/50 text-white text-sm lg:text-base rounded-lg border border-white/10 focus:outline-none focus:border-white/30 focus:bg-black/70 transition-all placeholder:text-gray-500"
                      placeholder="링크 제목 (선택사항)"
                    />
                  )}
                </div>
              ))}
              {links.length === 0 && (
                <p className="text-gray-500 text-xs lg:text-sm text-center py-4 lg:py-6">
                  링크가 없습니다. + 버튼을 눌러 링크를 추가하세요.
                </p>
              )}
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <p className="text-red-500 text-sm lg:text-base">{error}</p>
          )}

          {/* 버튼 */}
          <div className="flex gap-2 lg:gap-3 pt-2 border-t border-white/10 pb-4 lg:pb-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 lg:px-6 py-2.5 lg:py-3.5 bg-white/5 hover:bg-white/10 text-white text-sm lg:text-base rounded-xl transition-all font-medium"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 lg:px-6 py-2.5 lg:py-3.5 bg-white text-black text-sm lg:text-base font-semibold rounded-xl hover:bg-gray-100 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

