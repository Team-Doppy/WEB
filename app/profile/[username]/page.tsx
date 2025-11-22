import { fetchUserPosts, fetchProfileFeedSchema, fetchProfile } from '@/app/lib/dataFetcher';
import { validateUsernameParam } from '@/app/lib/pageHelpers';
import { ProfileHeader } from '@/app/components/ProfileHeader';
import { PostsSection } from '@/app/components/PostsSection';
import type { ProfileFeedSchemaResponse } from '@/app/types/feed.types';

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function UserPage({ params }: PageProps) {
  const { username } = await params;

  const validUsername = validateUsernameParam(username);
  
  // 스키마를 먼저 조회 (필수)
  const schema = await fetchProfileFeedSchema(validUsername);
  
  if (!schema) {
      return (
      <div className="min-h-screen bg-black">
        <main className="ml-0 lg:ml-64 transition-all duration-150">
          <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto pt-16 pb-12 px-4 lg:px-8">
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">프로필을 찾을 수 없습니다.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 스키마에서 프로필 정보 가져오기
  const userInfo = schema.userInfo;
  
  // 추가 프로필 정보 조회 (selfIntroduction, createdAt, linkTitles)
  // 스키마의 userInfo를 우선 사용하고, 추가 정보만 보완
  const profile = await fetchProfile(validUsername);
  
  // 초기 포스트만 가져오기 (첫 페이지)
  console.log('[ProfilePage] 초기 포스트 조회 시작:', { username: validUsername });
  const allPosts = await fetchUserPosts(validUsername, schema);
  // 최대 20개만 초기 로드
  const initialPosts = allPosts.slice(0, 20);
  console.log('[ProfilePage] 초기 포스트 조회 완료:', { postsCount: initialPosts.length, postIds: initialPosts.map(p => p.id) });

  // 프로필 정보 변환 (스키마의 userInfo + 추가 프로필 정보)
  const profileData = {
    username: userInfo.username,
    alias: userInfo.alias,
    profileImageUrl: userInfo.profileImageUrl,
    selfIntroduction: profile?.selfIntroduction || null,
    links: userInfo.links || [],
    linkTitles: profile?.linkTitles || {},
    createdAt: profile?.createdAt || '',
  };

  return (
    <div className="min-h-screen bg-black">
      {/* 모바일: 전체 너비 + 하단 네비게이션 패딩, 데스크톱: 사이드바 너비만큼 왼쪽 마진 */}
      <main className="ml-0 lg:ml-64 transition-all duration-150 pb-16 lg:pb-0">
        <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto pt-[30px] lg:pt-16 pb-12 px-4 lg:px-8">
          {/* Profile Header */}
          <ProfileHeader
            username={profileData.username}
            alias={profileData.alias}
            profileImageUrl={profileData.profileImageUrl}
            selfIntroduction={profileData.selfIntroduction}
            links={profileData.links}
            linkTitles={profileData.linkTitles}
            createdAt={profileData.createdAt}
            totalPosts={schema.userInfo.totalPosts}
            followersCount={schema.userInfo.followersCount}
            followingCount={schema.userInfo.followingCount}
          />

          {/* Posts Section */}
          {/* 포스트는 이미 스키마의 순서대로 정렬되어 반환됨 */}
          <PostsSection 
            username={validUsername} 
            initialPosts={initialPosts}
            schema={schema}
          />
        </div>
      </main>
    </div>
  );
}

// 메타데이터 생성
export async function generateMetadata({ params }: PageProps): Promise<any> {
  const { username } = await params;
  const validUsername = validateUsernameParam(username);
  
  // 프로필 정보 가져오기
  const schema = await fetchProfileFeedSchema(validUsername);
  if (!schema) {
    return {
      title: `${validUsername} - Doppy`,
      description: '프로필을 찾을 수 없습니다.',
    };
  }
  
  const profile = await fetchProfile(validUsername);
  const userInfo = schema.userInfo;
  
  // 프로필 이미지 URL 처리 (절대 URL로 변환)
  let profileImageUrl: string | undefined = undefined;
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'https://doppy.app';
  
  if (userInfo.profileImageUrl) {
    // 이미 절대 URL인 경우
    if (userInfo.profileImageUrl.startsWith('http://') || userInfo.profileImageUrl.startsWith('https://')) {
      profileImageUrl = userInfo.profileImageUrl;
    } else if (userInfo.profileImageUrl.startsWith('/')) {
      // 상대 경로인 경우 API URL과 결합
      profileImageUrl = apiBaseUrl ? `${apiBaseUrl}${userInfo.profileImageUrl}` : `${siteUrl}${userInfo.profileImageUrl}`;
    } else {
      // API URL과 결합
      profileImageUrl = apiBaseUrl ? `${apiBaseUrl}/${userInfo.profileImageUrl}` : `${siteUrl}/${userInfo.profileImageUrl}`;
    }
  }
  
  // 별칭 또는 사용자명
  const displayName = userInfo.alias || validUsername;
  const description = profile?.selfIntroduction || `${displayName}님의 프로필을 확인해보세요.`;
  const profileUrl = `${siteUrl}/profile/${validUsername}`;
  
  return {
    title: `${displayName} - Doppy`,
    description,
    openGraph: {
      title: `${displayName} - Doppy`,
      description,
      url: profileUrl,
      siteName: 'Doppy',
      images: profileImageUrl ? [
        {
          url: profileImageUrl,
          width: 400,
          height: 400,
          alt: `${displayName} 프로필 이미지`,
        },
      ] : [
        {
          url: `${siteUrl}/logo.png`,
          width: 400,
          height: 400,
          alt: 'Doppy',
        },
      ],
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title: `${displayName} - Doppy`,
      description,
      images: profileImageUrl ? [profileImageUrl] : [`${siteUrl}/logo.png`],
    },
    alternates: {
      canonical: profileUrl,
    },
  };
}

