import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Exercise } from '@learnhub/models';

export interface ContentListResponse {
  data: Exercise[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ContentFilters {
  search?: string;
  type?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ContentActionResponse {
  id: string;
  success?: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ContentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/admin/content';

  getContent(filters: ContentFilters = {}): Observable<ContentListResponse> {
    let params = new HttpParams();

    if (filters.search) params = params.set('search', filters.search);
    if (filters.type) params = params.set('type', filters.type);
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder)
      params = params.set('sortOrder', filters.sortOrder);
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());

    return this.http.get<ContentListResponse>(this.apiUrl, { params });
  }

  getContentItem(id: string): Observable<Exercise> {
    return this.http.get<Exercise>(`${this.apiUrl}/${id}`);
  }

  deleteContent(id: string): Observable<ContentActionResponse> {
    return this.http.delete<ContentActionResponse>(`${this.apiUrl}/${id}`);
  }
}
