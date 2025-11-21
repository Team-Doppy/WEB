import { fetchAllPosts } from '@/app/lib/dataFetcher';
import { HomeContent } from '@/app/components/HomeContent';

export default async function Home() {
  // 초기 포스트만 가져오기 (첫 페이지)
  const posts = await fetchAllPosts();
  // 최대 20개만 초기 로드
  const initialPosts = posts.slice(0, 20);

  return (
    <main className="min-h-screen bg-black">
      {/* 메인 콘텐츠 영역 - 사이드바 고려하여 중앙 정렬 */}
      <div className="ml-20 lg:ml-64 transition-all duration-150">
        <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto pt-16 pb-12 px-8">
          <HomeContent initialPosts={initialPosts} />
        </div>
      </div>
    </main>
  );
}