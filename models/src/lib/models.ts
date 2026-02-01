// TEMP: Initial assumptions. Will change as we define the data structures
export type UserStatus = 'active' | 'locked';
export type ContentStatus = 'active' | 'hidden' | 'deleted';
export type ReportStatus = 'open' | 'in_review' | 'closed';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  roles: string[];
  status: UserStatus;
  lastActiveAt?: string;
}

export interface Role {
  key: string;
  name: string;
  description?: string;
  permissions: string[];
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

export interface Report {
  id: string;
  contentId: string;
  reporterId: string;
  reason: string;
  status: ReportStatus;
  createdAt?: string;
}

export interface PlatformConfig {
  featureFlags: Record<string, boolean>;
  limits?: Record<string, number>;
  banners?: { id: string; message: string; active: boolean }[];
}

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  resource: string;
  payload?: Record<string, unknown>;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  status: 'open' | 'acknowledged' | 'closed';
  createdAt: string;
}

export interface AdminUserSession {
  token: string;
  user: Pick<AdminUser, 'id' | 'username' | 'email' | 'displayName' | 'roles'>;
}
