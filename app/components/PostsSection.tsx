'use client';

import { useState } from 'react';
import { PostCard } from '@/app/components/PostCard';
import { PostGrid } from '@/app/components/PostGrid';

interface PostsSectionProps {
  username: string;
  posts: any[];
}

export function PostsSection({ username, posts }: PostsSectionProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  return (
    <>
      {/* View Mode Section */}
      <div className="flex items-center justify-end mb-10 pb-5 border-b border-gray-800">
        {/* Grid/List 뷰 토글 버튼 */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-gray-700 text-white'
                : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-gray-700 text-white'
                : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Posts List Section */}
      <section>
        <h2 className="text-white text-3xl font-semibold mb-10">{username}'s other posts</h2>
        
        {/* List 뷰 */}
        {viewMode === 'list' && (
          <ul className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} username={username} />
            ))}
          </ul>
        )}

        {/* Grid 뷰 */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-3 gap-4">
            {posts.map((post) => (
              <PostGrid key={post.id} post={post} username={username} />
            ))}
          </div>
        )}

        {posts.length === 0 && (
          <p className="text-gray-400 text-center py-16">No posts found</p>
        )}
      </section>
    </>
  );
}