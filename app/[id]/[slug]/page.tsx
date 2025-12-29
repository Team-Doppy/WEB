import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Post } from '@/app/types/post.types';
import { validateAndFetchPost } from '@/app/lib/pageHelpers';
import { createSlug } from '@/app/lib/slug';
import { formatDate } from '@/app/utils/date';
import { ReadOnlyEditor } from '@/app/components/ReadOnlyEditor';
import { ProfileImage } from '@/app/components/ProfileImage';
import { PrivatePostView } from '@/app/components/PrivatePostView';
import { OpenInAppButton } from '@/app/components/OpenInAppButton';
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
    <div className="min-h-screen bg-black">
      {/* 모바일: 전체 너비 + 하단 네비게이션 패딩, 데스크톱: 사이드바 너비만큼 왼쪽 마진 */}
      <main className="pt-2 lg:pt-16 pb-16 px-4 ml-0 lg:ml-64 transition-all duration-150">
        <div className="max-w-4xl mx-auto">
          {/* User Info Section */}
          <Link href={`/profile/${post.author}`} className="block mb-6 lg:mb-10">
            <div className="flex items-center gap-2 lg:gap-4 p-2 lg:p-4 rounded-lg hover:bg-[#1a1a1a] transition-colors cursor-pointer">
              <ProfileImage
                src={post.authorProfileImageUrl}
                alt={post.author}
                size="sm"
                className="w-8 h-8 lg:w-12 lg:h-12 ring-1 lg:ring-2 ring-gray-700"
              />
              <div className="flex-1">
                <p className="text-white font-semibold text-sm lg:text-base">{post.author}</p>
                <p className="text-gray-400 text-xs lg:text-sm">
                  {formatDate(post.createdAt, 'medium')}
                </p>
              </div>
            </div>
          </Link>

          {/* Post Content */}
          <ReadOnlyEditor post={post} />
        </div>
      </main>
      
      {/* 앱에서 열기 버튼 (모바일 전용) */}
      <OpenInAppButton 
        type="post" 
        postId={post.id}
        username={post.author}
        profileImageUrl={post.authorProfileImageUrl}
        displayName={post.author}
      />
    </div>
  );
}

// 메타데이터 생성
export async function generateMetadata({ params }: PageProps): Promise<any> {
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
    
    // 사이트 URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'https://doppy.app';
    
    // 썸네일 이미지 URL 처리 (절대 URL로 변환)
    let thumbnailImageUrl: string | undefined = undefined;
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    
    if (post.thumbnailImageUrl) {
      // 이미 절대 URL인 경우
      if (post.thumbnailImageUrl.startsWith('http://') || post.thumbnailImageUrl.startsWith('https://')) {
        thumbnailImageUrl = post.thumbnailImageUrl;
      } else if (post.thumbnailImageUrl.startsWith('/')) {
        // 상대 경로인 경우 API URL과 결합
        thumbnailImageUrl = apiBaseUrl ? `${apiBaseUrl}${post.thumbnailImageUrl}` : `${siteUrl}${post.thumbnailImageUrl}`;
      } else {
        // API URL과 결합
        thumbnailImageUrl = apiBaseUrl ? `${apiBaseUrl}/${post.thumbnailImageUrl}` : `${siteUrl}/${post.thumbnailImageUrl}`;
      }
    }
    
    const postUrl = `${siteUrl}/${post.id}/${encodeURIComponent(createSlug(post.title))}`;
    const description = post.summary || post.title;
    
    return {
      title: `${post.title} - ${post.author}`,
      description,
      openGraph: {
        title: post.title,
        description,
        url: postUrl,
        siteName: 'Doppy',
        images: thumbnailImageUrl ? [
          {
            url: thumbnailImageUrl,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ] : [
          {
            url: `${siteUrl}/logo.png`,
            width: 1200,
            height: 630,
            alt: 'Doppy',
          },
        ],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description,
        images: thumbnailImageUrl ? [thumbnailImageUrl] : [`${siteUrl}/logo.png`],
      },
      alternates: {
        canonical: postUrl,
      },
    };
  } catch {
    return {
      title: '게시글을 찾을 수 없습니다',
    };
  }
}

