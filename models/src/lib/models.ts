export type UserStatus = 'active' | 'locked';

export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  status: UserStatus;
  lastActiveAt?: string;
  createdAt?: string;
}

export enum Status {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export enum TagVisibility {
  SEARCH_PAGE = 'SEARCH_PAGE',
  TAG_SELECT = 'TAG_SELECT'
}

export interface Tag {
  name: string;
  icon: string;
  color: string;
  backgroundImage: string;
}

export interface TagGroup {
  id: string;
  name: string;
  icon: string;
  tags: Tag[];
  visibility: TagVisibility;
}

export interface Source {
  url?: string;
  publishedAt?: Date;
  publisher?: string;
  organisation?: string;
}

export interface LearningContent {
  id: string;
  type: string;
  keywords?: string;
  downloads: number;
  likes: number;
  tags: Tag[];
  relatedCollectionId?: string;
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
  createdAt?: Date;
  changedAt?: Date;
}

export interface LearningContentCollection {
  id: string;
  title: string;
  status: Status;
  source?: Source;
  author?: string;
  contents: LearningContent[];
  contentIds?: string[];
  createdAt?: Date;
  changedAt?: Date;
}

export interface Category {
  id: string;
  name: string;
  disabled?: boolean;
  usageCount?: number;
}

export interface PlatformConfig {
  featureFlags: Record<string, boolean>;
  limits?: Record<string, number>;
  banners?: { id: string; message: string; active: boolean }[];
}

export interface UserSession {
  token: string;
  user: Pick<User, 'id' | 'username' | 'email' | 'displayName'>;
}
