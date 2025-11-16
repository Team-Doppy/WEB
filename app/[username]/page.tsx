import { fetchUserPosts } from '@/app/lib/dataFetcher';
import { validateUsernameParam } from '@/app/lib/pageHelpers';
import { UserHeader } from '@/app/components/Header';
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
  const posts = await fetchUserPosts(validUsername);

  // 첫 번째 게시글에서 사용자 정보 가져오기
  const userInfo = posts.length > 0 ? {
    profileImageUrl: posts[0].authorProfileImageUrl,
    username: posts[0].author,
  } : null;

  return (
    <div className="min-h-screen bg-[#121212]">
      <UserHeader username={validUsername} />
      <main className="pt-14 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Profile Section - 위아래 여백 추가 */}
          <div className="flex flex-col items-center my-12">
            {userInfo && (
              <>
                <ProfileImage
                  src={userInfo.profileImageUrl}
                  alt={username}
                  size="lg"
                  className="mb-6 ring-4 ring-gray-800"
                />
                <h1 className="text-white text-2xl font-bold">{username}</h1>
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