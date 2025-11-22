'use client';

import React from 'react';
import { useSearch } from '@/app/contexts/SearchContext';

interface SearchResultsHeaderProps {
  onOpenSearch: () => void;
}

export const SearchResultsHeader: React.FC<SearchResultsHeaderProps> = ({ onOpenSearch }) => {
  const { searchResults, searchQuery, clearSearchResults } = useSearch();

  if (!searchResults || !searchQuery) {
    return null;
  }

  return (
    <div className="mb-8 flex items-center justify-between">
      <button
        onClick={onOpenSearch}
        className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 transition-colors group min-w-[300px]"
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <div className="flex flex-col items-start">
          <span className="text-white text-base font-semibold">{searchQuery}</span>
        </div>
      </button>
      <button
        onClick={clearSearchResults}
        className="text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5 flex items-center justify-center"
      >
        {/* 모바일: X 아이콘, 데스크톱: 지우기 텍스트 */}
        <svg 
          className="w-5 h-5 lg:hidden" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M6 18L18 6M6 6l12 12" 
          />
        </svg>
        <span className="hidden lg:inline text-sm">지우기</span>
      </button>
    </div>
  );
};

