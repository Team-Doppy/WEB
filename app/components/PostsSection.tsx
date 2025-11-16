'use client';

import { useState } from 'react';
import { PostCard } from '@/app/components/PostCard';
import { PostGrid } from '@/app/components/PostGrid';

interface PostsSectionProps {
  username: string;
  posts: any[];
}

export function PostsSection({ username, posts }: PostsSectionProps) {
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const categories = ['전체', '카테고리 1', '카테고리 2'];

  return (
    <>
      {/* Sort Section */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-800">
        {/* Sort 토글 버튼 */}
        <div className="relative">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            {selectedCategory}
            <svg
              className={`w-4 h-4 transition-transform ${sortOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {/* 드롭다운 메뉴 */}
          {sortOpen && (
            <div className="absolute top-full mt-2 bg-gray-800 rounded-lg shadow-lg overflow-hidden z-10 min-w-full">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setSortOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                    selectedCategory === category
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grid/List 뷰 토글 버튼 */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-blue-600 text-white'
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
                ? 'bg-blue-600 text-white'
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
        <h2 className="text-white text-xl font-semibold mb-6">{username}'s other posts</h2>
        
        {/* List 뷰 */}
        {viewMode === 'list' && (
          <ul className="space-y-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} username={username} />
            ))}
          </ul>
        )}

        {/* Grid 뷰 */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-3 gap-3">
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