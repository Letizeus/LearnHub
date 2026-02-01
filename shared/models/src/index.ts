export * from './lib/models';

export interface LearningAnalytics {
  interactions: {
    type: 'VIEW' | 'PDF-CREATOR' | 'DOWNLOAD';
    user: string;
    time: number;
  }[];
  searchKeywords: string[];
}

export interface LearningContentCollection {
  id: string;
  title: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  source: {
    url?: string;
    publishedAt?: Date;
    publisher?: string;
    organisation?: string;
  };
  previewImage?: string;
  length: number;
  author: string;
  createdAt: Date;
  changedAt: Date;
  contents: LearningContent[] | string[];
}

export interface LearningContent {
  id: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  type: string;
  downloads: number;
  likes: number;
  tags: Tag[] | string[];
  relatedCollection: LearningContentCollection;
  analytics: LearningAnalytics;
}

export interface SearchQuery {
  query: string;
  tags?: string[];
  collection?: string;
}

export interface SearchQueryPopulated {
  query: string;
  tags?: Tag[];
  collection?: LearningContentCollection;
}

export interface SearchResult {
  exercises: {
    items: string[];
    length: number;
  };
  collections: {
    items: string[];
    length: number;
  };
}

export interface SearchResultPopulated {
  collections: {
    items: (LearningContentCollection | undefined)[];
    length: number;
  };
  exercises: {
    items: (Exercise | undefined)[];
    length: number;
  };
}

export interface Exercise extends LearningContent {
  type: 'EXERCISE';
  text: string;
  images?: string[];
  tip?: string;
  solution?: string;
  solutionImages?: string[];
  eval_points?: number;
  total_points?: number;
}

export type Folder = {
  id: string;
  name: string;
  icon?: string;
  content: string[];
  length: number;
};

export enum TagVisibilityPlace {
  SEARCH_PAGE = 'SEARCH_PAGE',
  TAG_SELECT = 'TAG_SELECT',
}

export interface TagVisibility {
  place: TagVisibilityPlace;
  position?: number;
}

export interface TagGroup {
  id: TagID;
  name: string;
  icon?: string;
  tags: TagID[];
  visibility: TagVisibility[];
}

export interface TagGroupPopulated {
  id: TagID;
  name: string;
  icon?: string;
  tags: Tag[];
  visibility: TagVisibility[];
}

export interface Tag {
  id: TagID;
  name: string;
  icon?: string;
  color?: string;
  backgroundImage?: string;
}

export type TagID = string;

export type FeedbackContent = {
  type: 'VIEW';
  content: LearningContent | string;
};

export interface ContentRelationFeedback {
  type: 'CONTENT' | 'COLLECTION';
  id: string;
  searchQuery?: SearchQueryPopulated;
  content?: string;
  collection?: string;
}

export const LEARNING_CONTENT_NAME = 'learning_content'
export const LEARNING_CONTENT_COLLECTION_NAME = 'learning_content_collection'