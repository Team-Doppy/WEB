import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black ml-0 lg:ml-64 flex items-center justify-center px-4 transition-all duration-150">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-200 mb-4">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="text-gray-400 mb-8">
          요청하신 게시글이나 사용자를 찾을 수 없습니다.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

