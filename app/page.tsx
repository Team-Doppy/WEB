import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#121212] flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-white mb-6">
          Doppy
        </h1>
        <p className="text-xl text-gray-300 mb-12">
          블록 기반 콘텐츠 플랫폼
        </p>
        
        <div className="space-y-4">
          <p className="text-gray-300">
            URL 형식: <code className="bg-gray-800 px-3 py-1 rounded text-gray-200">/{'{username}'}/{'{title-slug-id}'}</code>
          </p>
          <p className="text-sm text-gray-400">
            예시: /affection_jh/애한제야-170
          </p>
          
          <div className="pt-6 flex gap-4 justify-center">
            <Link
              href="/affection_jh"
              className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              사용자 페이지 보기
            </Link>
            <Link
              href="/affection_jh/애한제야-170"
              className="inline-block px-8 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
            >
              게시글 상세 보기
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
