export default function Loading() {
  return (
    <main className="min-h-screen bg-black">
      <div className="ml-0 lg:ml-64 transition-all duration-150 pb-16 lg:pb-0">
        <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto pt-10 lg:pt-16 pb-2 lg:pb-12 px-2 lg:px-8">
          {/* 피드 게시글 스켈레톤 */}
          <div className="space-y-2 lg:space-y-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`mb-2 lg:mb-12 pb-2 lg:pb-12 relative bg-black ${i === 0 ? 'pt-4 lg:pt-0' : ''}`}>
                {/* 작성자 정보 스켈레톤 */}
                <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-6">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-[#1a1a1a] animate-shimmer flex-shrink-0"></div>
                  <div className="h-4 bg-[#1a1a1a] rounded animate-shimmer w-20 flex-1"></div>
                  <div className="h-4 bg-[#1a1a1a] rounded animate-shimmer w-24"></div>
                </div>

                {/* 모바일: 가로 배치 (이미지 옆에 세로 제목), 데스크톱: 가로 배치 */}
                <div className="flex flex-row lg:flex-row gap-3 lg:gap-12 items-start mb-3 lg:mb-6">
                  {/* 썸네일 스켈레톤 - 모바일: 가변 너비, 데스크톱: 큰 크기 */}
                  <div className="flex-1 lg:flex-shrink-0">
                    <div className="relative w-full lg:w-[500px] xl:w-[600px] aspect-[4/5] bg-[#1a1a1a] rounded-lg animate-shimmer overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a]"></div>
                    </div>
                  </div>
                  
                  {/* 텍스트 콘텐츠 스켈레톤 - 모바일: 세로 제목, 데스크톱: 가로 제목 + summary */}
                  <div className="flex-shrink-0 flex items-center lg:items-start lg:flex-col lg:justify-start">
                    {/* 제목 스켈레톤 - 모바일: 세로, 데스크톱: 가로 */}
                    <div className="bg-[#1a1a1a] rounded animate-shimmer w-6 h-[120px] lg:w-[200px] lg:h-12" 
                      data-mobile-vertical="true"
                    ></div>
                    {/* 데스크톱 summary 스켈레톤 */}
                    <div className="hidden lg:block space-y-2 mt-4">
                      <div className="h-6 bg-[#1a1a1a] rounded animate-shimmer w-full"></div>
                      <div className="h-6 bg-[#1a1a1a] rounded animate-shimmer w-4/5"></div>
                    </div>
                  </div>
                </div>

                {/* 하트 버튼 스켈레톤 */}
                <div className="absolute bottom-0 right-0 mr-2 lg:mr-4 mb-2 lg:mb-4">
                  <div className="flex items-center gap-2 lg:gap-3">
                    <div className="w-6 h-6 lg:w-8 lg:h-8 bg-[#1a1a1a] rounded animate-shimmer"></div>
                    <div className="h-4 bg-[#1a1a1a] rounded animate-shimmer w-8"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

