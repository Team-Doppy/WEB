import Link from 'next/link';
import { Post } from '@/app/types/post.types';
import { extractPostId } from '@/app/lib/slug';
import { fetchPostData } from '@/app/lib/dataFetcher';
import { validateAndFetchPost } from '@/app/lib/pageHelpers';
import { formatDate } from '@/app/utils/date';
import { PostHeader } from '@/app/components/Header';
import { ReadOnlyEditor } from '@/app/components/ReadOnlyEditor';
import { ProfileImage } from '@/app/components/ProfileImage';
import { ThumbnailImage } from '@/app/components/ThumbnailImage';

interface PageProps {
  params: Promise<{
    username: string;
    postId: string; // 실제로는 "title-slug-123" 형태
  }>;
}

export default async function PostPage({ params }: PageProps) {
  const { username, postId: slugWithId } = await params;

  const post = await validateAndFetchPost(username, slugWithId);

  return (
    <div className="min-h-screen bg-[#121212]">
      <PostHeader />
      <main className="pt-14 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Thumbnail Card */}
          <div className="mb-10 rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
            <ThumbnailImage
              src={post.thumbnailImageUrl}
              alt={post.title}
            />
          </div>

          {/* User Info Section */}
          <Link href={`/${post.author}`} className="block mb-10">
            <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer">
              <ProfileImage
                src={post.authorProfileImageUrl}
                alt={post.author}
                size="md"
                className="ring-2 ring-gray-700"
              />
              <div className="flex-1">
                <p className="text-white font-semibold">{post.author}</p>
                <p className="text-gray-400 text-sm">
                  {formatDate(post.createdAt, 'medium')}
                </p>
              </div>
            </div>
          </Link>

          {/* Post Content */}
          <ReadOnlyEditor post={post} />
        </div>
      </main>
    </div>
  );
}

// 메타데이터 생성
export async function generateMetadata({ params }: PageProps) {
  const { username, postId: slugWithId } = await params;
  
  try {
    const post = await validateAndFetchPost(username, slugWithId);
    
    return {
      title: `${post.title} - ${post.author}`,
      description: post.summary || post.title,
      openGraph: {
        title: post.title,
        description: post.summary || post.title,
        images: [post.thumbnailImageUrl],
      },
    };
  } catch {
    return {
      title: '게시글을 찾을 수 없습니다',
    };
  }
}
