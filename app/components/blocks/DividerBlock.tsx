'use client';

import React from 'react';
import { DividerNode } from '@/app/types/post.types';

interface DividerBlockProps {
  node: DividerNode;
}

export const DividerBlock: React.FC<DividerBlockProps> = ({ node }) => {
  return (
    <div className="my-8 flex items-center justify-center">
      <div className="w-full max-w-md h-[1px] bg-white/50" />
    </div>
  );
};

