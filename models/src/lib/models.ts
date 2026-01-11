// TEMP: Initial assumptions. Will change as we define the data structures
export type UserStatus = 'active' | 'locked';
export type ContentStatus = 'active' | 'hidden' | 'deleted';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  status: UserStatus;
  lastActiveAt?: string;
}

export interface Course {
  id: string;
  title: string;
  categoryId?: string;
  status: 'active' | 'archived';
  moduleCount?: number;
  updatedAt?: string;
}

export interface ContentItem {
  id: string;
  title: string;
  ownerId: string;
  courseId?: string;
  type: string;
  status: ContentStatus;
  createdAt?: string;
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

export interface AdminUserSession {
  token: string;
  user: Pick<AdminUser, 'id' | 'username' | 'email' | 'displayName'>;
}
