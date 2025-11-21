import { fetchUserPosts, fetchProfile } from '@/app/lib/dataFetcher';
import { validateUsernameParam } from '@/app/lib/pageHelpers';
import { ProfileImage } from '@/app/components/ProfileImage';
import { PostsSection } from '@/app/components/PostsSection';

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function UserPage({ params }: PageProps) {
  const { username } = await params;

  const validUsername = validateUsernameParam(username);
  const [posts, profile] = await Promise.all([
    fetchUserPosts(validUsername),
    fetchProfile(validUsername),
  ]);

  // 프로필 정보 또는 첫 번째 게시글에서 사용자 정보 가져오기
  const userInfo = profile ? {
    profileImageUrl: profile.profileImageUrl || null,
    username: profile.username,
    alias: profile.alias,
  } : (posts.length > 0 ? {
    profileImageUrl: posts[0].authorProfileImageUrl,
    username: posts[0].author,
    alias: posts[0].author,
  } : null);

  return (
    <div className="min-h-screen bg-[#121212]">
      <main className="pt-8 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Profile Section - 위아래 여백 추가 */}
          <div className="flex flex-col items-center my-16">
            {userInfo && (
              <>
                {userInfo.profileImageUrl && (
                  <ProfileImage
                    src={userInfo.profileImageUrl}
                    alt={username}
                    size="xl"
                    className="mb-8 ring-2 ring-white/30"
                  />
                )}
                <h1 className="text-white text-4xl font-bold mb-3">{userInfo.alias || username}</h1>
                {profile?.selfIntroduction && (
                  <p className="text-gray-400 text-lg mb-6 text-center max-w-2xl">
                    {profile.selfIntroduction}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Posts Section - 클라이언트 컴포넌트로 분리 */}
          <PostsSection username={validUsername} posts={posts} />
        </div>
      </main>
    </div>
  );
}

// 메타데이터 생성
export async function generateMetadata({ params }: PageProps) {
  const { username } = await params;
  const validUsername = validateUsernameParam(username);
  
  return {
    title: `${validUsername} - Doppy`,
    description: `View ${validUsername}'s posts on Doppy`,
  };
}