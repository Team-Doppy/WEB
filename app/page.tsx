import { fetchAllPosts } from '@/app/lib/dataFetcher';
import { HomeContent } from '@/app/components/HomeContent';
import { unstable_cache } from 'next/cache';

// 홈 데이터 캐싱 (5분간 캐시)
const getCachedHomePosts = unstable_cache(
  async () => {
    const posts = await fetchAllPosts();
    return posts.slice(0, 20);
  },
  ['home-posts'],
  {
    revalidate: 300, // 5분 (300초)
    tags: ['home-posts']
  }
);

export default async function Home() {
  // 캐시된 초기 포스트 가져오기 (최대 20개)
  const initialPosts = await getCachedHomePosts();

  return (
    <main className="min-h-screen bg-black">
      {/* 메인 콘텐츠 영역 - 사이드바 고려하여 중앙 정렬 */}
      {/* 모바일: 전체 너비 + 하단 네비게이션 패딩, 데스크톱: 사이드바 너비만큼 왼쪽 마진 */}
      <div className="ml-0 lg:ml-64 transition-all duration-150 pb-16 lg:pb-0">
        <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto pt-[30px] lg:pt-16 pb-2 lg:pb-12 px-4 lg:px-8">
          <HomeContent initialPosts={initialPosts} />
        </div>
      </div>
    </main>
  );
}