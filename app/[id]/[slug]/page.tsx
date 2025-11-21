import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Post } from '@/app/types/post.types';
import { validateAndFetchPost } from '@/app/lib/pageHelpers';
import { createSlug } from '@/app/lib/slug';
import { formatDate } from '@/app/utils/date';
import { ReadOnlyEditor } from '@/app/components/ReadOnlyEditor';
import { ProfileImage } from '@/app/components/ProfileImage';
import { PrivatePostView } from '@/app/components/PrivatePostView';
import { ApiError } from '@/app/lib/api';

interface PageProps {
  params: Promise<{
    id: string;
    slug: string;
  }>;
}

export default async function PostPage({ params }: PageProps) {
  const { id, slug } = await params;

  const result = await validateAndFetchPost(id, slug);

  // 비공개 글인 경우
  if (result && typeof result === 'object' && 'isPrivate' in result) {
    const error = result as ApiError;
    // API 응답에서 username을 받아서 전달
    return <PrivatePostView username={error.username || ""} />;
  }

  const post = result as Post;

  // slug가 포스트 제목과 일치하지 않으면 올바른 URL로 리다이렉트
  const expectedSlug = createSlug(post.title);
  const decodedSlug = decodeURIComponent(slug);
  
  if (decodedSlug !== expectedSlug) {
    // 올바른 URL로 리다이렉트
    redirect(`/${id}/${encodeURIComponent(expectedSlug)}`);
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      <main className="pt-16 pb-16 px-4 ml-20 lg:ml-64 transition-all duration-150">
        <div className="max-w-4xl mx-auto">
          {/* User Info Section */}
          <Link href={`/profile/${post.author}`} className="block mb-10">
            <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-[#1a1a1a] transition-colors cursor-pointer">
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
  const { id, slug } = await params;
  
  try {
    const result = await validateAndFetchPost(id, slug);
    
    // 비공개 글인 경우
    if (result && typeof result === 'object' && 'isPrivate' in result) {
      return {
        title: '비공개 글 - Doppy',
        description: '이 글은 특정 사용자에게만 공개되었습니다.',
      };
    }
    
    const post = result as Post;
    
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

