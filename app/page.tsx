import { fetchAllPosts } from '@/app/lib/dataFetcher';
import { FeedPost } from '@/app/components/FeedPost';

export default async function Home() {
  const posts = await fetchAllPosts();

  return (
    <main className="min-h-screen bg-black">
      <div className="flex">
        {/* 사이드바는 layout.tsx에서 렌더링 */}
        
        {/* 메인 콘텐츠 영역 */}
        <div className="flex-1 ml-64">
          <div className="max-w-7xl mx-auto py-12 px-8">
            {/* 피드 게시글 목록 */}
            <div>
              {posts.length > 0 ? (
                posts.map((post) => (
                  <FeedPost key={`${post.username}-${post.id}`} post={post} username={post.username} />
                ))
              ) : (
                <div className="text-center py-16">
                  <p className="text-gray-400">게시글이 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 오른쪽 사이드바 (선택사항) */}
        <aside className="hidden lg:block w-80 p-8">
          {/* 추천 사용자, 광고 등 */}
        </aside>
      </div>
    </main>
  );
}