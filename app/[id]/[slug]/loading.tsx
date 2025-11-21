export default function Loading() {
  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="pt-14 pb-16 px-4 ml-20 lg:ml-64 transition-all duration-150">
        <div className="max-w-4xl mx-auto">
          {/* 로딩 스켈레톤 */}
          <div>
            {/* 사용자 정보 스켈레톤 */}
            <div className="flex items-center gap-4 p-4 mb-10">
              <div className="w-16 h-16 rounded-full bg-[#1a1a1a] animate-shimmer overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a]"></div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-[#1a1a1a] rounded-md animate-shimmer w-32"></div>
                <div className="h-4 bg-[#1a1a1a] rounded-md animate-shimmer w-24"></div>
              </div>
            </div>

            {/* 콘텐츠 스켈레톤 */}
            <div className="space-y-8">
              <div className="h-10 bg-[#1a1a1a] rounded-md animate-shimmer w-3/4"></div>
              <div className="space-y-4">
                <div className="h-6 bg-[#1a1a1a] rounded animate-shimmer w-full"></div>
                <div className="h-6 bg-[#1a1a1a] rounded animate-shimmer w-full"></div>
                <div className="h-6 bg-[#1a1a1a] rounded animate-shimmer w-4/5"></div>
              </div>
              <div className="w-full h-[500px] bg-[#1a1a1a] rounded-lg animate-shimmer overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a]"></div>
              </div>
              <div className="space-y-4">
                <div className="h-6 bg-[#1a1a1a] rounded animate-shimmer w-full"></div>
                <div className="h-6 bg-[#1a1a1a] rounded animate-shimmer w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

