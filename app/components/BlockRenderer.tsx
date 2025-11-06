'use client';

import React from 'react';
import { ContentNode } from '@/app/types/post.types';
import { ParagraphBlock } from './blocks/ParagraphBlock';
import { ImageBlock } from './blocks/ImageBlock';
import { VideoBlock } from './blocks/VideoBlock';
import { MentionBlock } from './blocks/MentionBlock';
import { ImageRowBlock } from './blocks/ImageRowBlock';

interface BlockRendererProps {
  node: ContentNode;
  authorInfo?: {
    author: string;
    authorProfileImageUrl: string;
    createdAt: string;
  };
  viewCount?: number;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({ node, authorInfo, viewCount }) => {
  switch (node.type) {
    case 'paragraph':
      return <ParagraphBlock node={node} authorInfo={authorInfo} viewCount={viewCount} />;
    case 'image':
      return <ImageBlock node={node} />;
    case 'video':
      return <VideoBlock node={node} />;
    case 'mention':
      return <MentionBlock node={node} />;
    case 'imageRow':
      return <ImageRowBlock node={node} />;
    default:
      return null;
  }
};

