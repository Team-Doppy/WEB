export default function Loading() {
  return (
    <main className="min-h-screen bg-black">
      <div className="ml-20 lg:ml-64 transition-all duration-150">
        <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto py-12 px-8">
          {/* 피드 게시글 스켈레톤 */}
          <div className="space-y-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-4">
                {/* 게시글 카드 스켈레톤 */}
                <div className="flex gap-6">
                  {/* 썸네일 스켈레톤 */}
                  <div className="w-[400px] lg:w-[500px] xl:w-[600px] aspect-[4/5] bg-[#1a1a1a] rounded-lg animate-shimmer overflow-hidden flex-shrink-0">
                    <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a]"></div>
                  </div>
                  
                  {/* 텍스트 콘텐츠 스켈레톤 */}
                  <div className="flex-1 space-y-4 py-4">
                    <div className="h-8 bg-[#1a1a1a] rounded animate-shimmer w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-5 bg-[#1a1a1a] rounded animate-shimmer w-full"></div>
                      <div className="h-5 bg-[#1a1a1a] rounded animate-shimmer w-full"></div>
                      <div className="h-5 bg-[#1a1a1a] rounded animate-shimmer w-4/5"></div>
                    </div>
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

