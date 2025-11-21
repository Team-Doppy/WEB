export default function Loading() {
  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="pt-14 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* 로딩 스켈레톤 */}
          <div className="animate-pulse">
            {/* 사용자 정보 스켈레톤 */}
            <div className="flex items-center gap-4 p-4 mb-10">
              <div className="w-16 h-16 rounded-full bg-gray-800"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-800 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-800 rounded w-24"></div>
              </div>
            </div>

            {/* 콘텐츠 스켈레톤 */}
            <div className="space-y-6">
              <div className="h-8 bg-gray-800 rounded w-3/4"></div>
              <div className="h-4 bg-gray-800 rounded w-full"></div>
              <div className="h-4 bg-gray-800 rounded w-5/6"></div>
              <div className="h-64 bg-gray-800 rounded"></div>
              <div className="h-4 bg-gray-800 rounded w-full"></div>
              <div className="h-4 bg-gray-800 rounded w-4/5"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

