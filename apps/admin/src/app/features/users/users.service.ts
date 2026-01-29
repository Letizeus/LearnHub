import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '@learnhub/models';

export interface UsersListResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserFilters {
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface UserActionResponse {
  id: string;
  status?: string;
  success?: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/admin/users';

  getUsers(filters: UserFilters = {}): Observable<UsersListResponse> {
    let params = new HttpParams();

    if (filters.search) params = params.set('search', filters.search);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());

    return this.http.get<UsersListResponse>(this.apiUrl, { params });
  }

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  updateUser(id: string, data: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}`, data);
  }

  lockUser(id: string): Observable<UserActionResponse> {
    return this.http.post<UserActionResponse>(`${this.apiUrl}/${id}/lock`, {});
  }

  unlockUser(id: string): Observable<UserActionResponse> {
    return this.http.post<UserActionResponse>(`${this.apiUrl}/${id}/unlock`, {});
  }

  deleteUser(id: string): Observable<UserActionResponse> {
    return this.http.delete<UserActionResponse>(`${this.apiUrl}/${id}`);
  }
}
