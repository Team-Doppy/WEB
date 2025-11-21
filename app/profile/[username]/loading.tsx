export default function Loading() {
  return (
    <div className="min-h-screen bg-black">
      <main className="ml-20 lg:ml-64 transition-all duration-150">
        <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto pt-16 pb-12 px-8">
          {/* Profile Header 스켈레톤 */}
          <div className="mb-16 pb-10 border-b border-white/10 px-6 md:px-8">
            <div className="flex gap-8 md:gap-12 items-start">
              {/* 왼쪽: 프로필 이미지 스켈레톤 */}
              <div className="flex-shrink-0">
                <div className="w-[180px] h-[180px] md:w-[220px] md:h-[220px] lg:w-[240px] lg:h-[240px] rounded-full bg-[#1a1a1a] animate-shimmer overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a]"></div>
                </div>
              </div>

              {/* 오른쪽: 사용자 정보 스켈레톤 */}
              <div className="flex-1 min-w-0 flex flex-col">
                {/* 사용자명과 별칭 스켈레톤 */}
                <div className="mb-3 space-y-2">
                  <div className="h-10 md:h-12 lg:h-14 bg-[#1a1a1a] rounded-lg animate-shimmer w-48"></div>
                  <div className="h-8 md:h-10 lg:h-12 bg-[#1a1a1a] rounded-lg animate-shimmer w-40"></div>
                </div>

                {/* 소개글 스켈레톤 */}
                <div className="space-y-2 mb-4">
                  <div className="h-5 bg-[#1a1a1a] rounded-lg animate-shimmer w-full"></div>
                  <div className="h-5 bg-[#1a1a1a] rounded-lg animate-shimmer w-4/5"></div>
                  <div className="h-5 bg-[#1a1a1a] rounded-lg animate-shimmer w-3/4"></div>
                </div>

                {/* 링크 스켈레톤 */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6">
                  <div className="h-10 bg-[#1a1a1a] rounded-lg animate-shimmer w-32"></div>
                  <div className="h-10 bg-[#1a1a1a] rounded-lg animate-shimmer w-28"></div>
                </div>

                {/* 팔로우 버튼 스켈레톤 */}
                <div className="mt-auto">
                  <div className="h-12 bg-[#1a1a1a] rounded-2xl animate-shimmer w-full max-w-lg"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Posts Section 스켈레톤 */}
          <div className="space-y-8">
            {/* 뷰 토글 스켈레톤 */}
            <div className="flex items-center gap-4 mb-6">
              <div className="h-10 bg-[#1a1a1a] rounded-lg animate-shimmer w-24"></div>
              <div className="h-10 bg-[#1a1a1a] rounded-lg animate-shimmer w-24"></div>
            </div>

            {/* 이미지 그리드 스켈레톤 */}
            <div className="grid grid-cols-3 gap-0.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square bg-[#1a1a1a] animate-shimmer overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a]"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

