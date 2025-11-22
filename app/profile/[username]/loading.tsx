export default function Loading() {
  return (
    <div className="min-h-screen bg-black">
      <main className="ml-0 lg:ml-64 transition-all duration-150 pb-16 lg:pb-0">
        <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto pt-[30px] lg:pt-16 pb-12 px-4 lg:px-8">
          {/* Profile Header 스켈레톤 - 모바일: 이미지 옆에 설명 */}
          <div className="mb-8 lg:mb-16 pb-6 lg:pb-10 border-b border-white/10">
            <div className="flex flex-col lg:flex-row gap-4 md:gap-8 lg:gap-12 items-start">
              {/* 모바일: 이미지 옆에 설명들 */}
              <div className="flex flex-row lg:flex-row gap-4 md:gap-8 lg:gap-12 w-full lg:w-auto items-start">
                {/* 왼쪽: 프로필 이미지 스켈레톤 */}
                <div className="flex-shrink-0 mt-2 lg:mt-0">
                  <div className="w-[100px] h-[100px] md:w-[180px] md:h-[180px] lg:w-[220px] lg:h-[220px] rounded-full bg-[#1a1a1a] animate-shimmer overflow-hidden border border-white/20">
                    <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a]"></div>
                  </div>
                </div>

                {/* 오른쪽: 사용자 정보 스켈레톤 */}
                <div className="flex-1 min-w-0 flex flex-col min-h-[100px] md:min-h-[180px] lg:min-h-[220px]">
                  {/* 사용자명과 별칭 스켈레톤 */}
                  <div className="mb-1 lg:mb-3 space-y-1">
                    <div className="h-7 md:h-10 lg:h-14 bg-[#1a1a1a] rounded animate-shimmer w-32 md:w-48"></div>
                    <div className="h-6 md:h-8 lg:h-12 bg-[#1a1a1a] rounded animate-shimmer w-28 md:w-40"></div>
                  </div>

                  {/* 소개글 스켈레톤 */}
                  <div className="space-y-1 mb-2 lg:mb-4">
                    <div className="h-4 md:h-5 bg-[#1a1a1a] rounded animate-shimmer w-full"></div>
                    <div className="h-4 md:h-5 bg-[#1a1a1a] rounded animate-shimmer w-4/5"></div>
                    <div className="h-4 md:h-5 bg-[#1a1a1a] rounded animate-shimmer w-3/4"></div>
                  </div>

                  {/* 링크 스켈레톤 */}
                  <div className="flex flex-col gap-y-1 lg:gap-y-2 mb-2 lg:mb-6">
                    <div className="h-4 md:h-5 lg:h-6 bg-[#1a1a1a] rounded animate-shimmer w-32"></div>
                    <div className="h-4 md:h-5 lg:h-6 bg-[#1a1a1a] rounded animate-shimmer w-28"></div>
                  </div>
                </div>
              </div>

              {/* 모바일: 버튼 스켈레톤 */}
              <div className="lg:hidden w-full flex gap-2 px-4">
                <div className="h-10 bg-[#1a1a1a] rounded-xl animate-shimmer flex-1"></div>
              </div>

              {/* 데스크톱: 버튼 스켈레톤 */}
              <div className="hidden lg:block mt-auto">
                <div className="h-12 bg-[#1a1a1a] rounded-2xl animate-shimmer w-[400px]"></div>
              </div>
            </div>
          </div>

          {/* Posts Section 스켈레톤 */}
          <div>
            {/* 뷰 토글 스켈레톤 */}
            <div className="flex items-center gap-4 mb-6 lg:mb-8">
              <div className="h-8 lg:h-10 bg-[#1a1a1a] rounded-lg animate-shimmer w-10 lg:w-24"></div>
              <div className="h-8 lg:h-10 bg-[#1a1a1a] rounded-lg animate-shimmer w-10 lg:w-24"></div>
            </div>

            {/* 카드뷰 스켈레톤 - 모바일: 가로 레이아웃 */}
            <ul className="pt-4 space-y-0.5 lg:space-y-0.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <li key={i} className="mb-0.5 lg:mb-0.5 pb-0.5 lg:pb-0.5">
                  <article className="relative cursor-pointer">
                    <div className="flex flex-row gap-3 lg:gap-6 items-start">
                      {/* 이미지 영역 - 왼쪽 */}
                      <div className="relative flex-shrink-0 w-[150px] md:w-[180px] lg:w-[300px] xl:w-[350px] aspect-[4/5] bg-[#1a1a1a] rounded-lg animate-shimmer overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a]"></div>
                        {/* 뷰카운트 스켈레톤 */}
                        <div className="absolute bottom-0 left-0 pl-1 pb-1 lg:pl-2 lg:pb-2">
                          <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-[#1a1a1a] animate-shimmer"></div>
                        </div>
                      </div>
                      
                      {/* 텍스트 콘텐츠 영역 - 오른쪽 */}
                      <div className="flex-1 min-w-0 flex flex-col gap-2 lg:gap-3">
                        {/* 제목 스켈레톤 */}
                        <div className="h-5 md:h-6 lg:h-8 xl:h-9 bg-[#1a1a1a] rounded animate-shimmer w-full md:w-4/5"></div>
                        
                        {/* 타임스탬프 스켈레톤 */}
                        <div className="h-3 md:h-4 lg:h-5 bg-[#1a1a1a] rounded animate-shimmer w-24"></div>
                        
                        {/* 써머리 스켈레톤 */}
                        <div className="space-y-1.5 hidden lg:block">
                          <div className="h-4 lg:h-5 xl:h-6 bg-[#1a1a1a] rounded animate-shimmer w-full"></div>
                          <div className="h-4 lg:h-5 xl:h-6 bg-[#1a1a1a] rounded animate-shimmer w-4/5"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* 하트 버튼 스켈레톤 - 카드 우측 하단 */}
                    <div className="absolute bottom-0 right-0 flex items-center gap-1.5 lg:gap-2">
                      <div className="w-5 h-5 lg:w-6 lg:h-6 bg-[#1a1a1a] rounded animate-shimmer"></div>
                      <div className="h-4 lg:h-5 bg-[#1a1a1a] rounded animate-shimmer w-6 lg:w-8"></div>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

