'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Post } from '@/app/types/post.types';
import type { PaginatedResponse } from '@/app/lib/clientApi';

interface SearchContextType {
  searchResults: Post[] | null;
  searchQuery: string | null;
  searchPagination: PaginatedResponse<Post> | null;
  setSearchResults: (results: Post[] | null, query: string | null, pagination?: PaginatedResponse<Post> | null) => void;
  clearSearchResults: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [searchResults, setSearchResultsState] = useState<Post[] | null>(null);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [searchPagination, setSearchPagination] = useState<PaginatedResponse<Post> | null>(null);

  const setSearchResults = (results: Post[] | null, query: string | null, pagination?: PaginatedResponse<Post> | null) => {
    setSearchResultsState(results);
    setSearchQuery(query);
    setSearchPagination(pagination || null);
  };

  const clearSearchResults = () => {
    setSearchResultsState(null);
    setSearchQuery(null);
    setSearchPagination(null);
  };

  return (
    <SearchContext.Provider value={{ searchResults, searchQuery, searchPagination, setSearchResults, clearSearchResults }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider');
  }
  return context;
};

