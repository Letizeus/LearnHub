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
  collectionId?: string;
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

  private buildParams(filters: ContentFilters): HttpParams {
    let params = new HttpParams();
    if (filters.search) params = params.set('search', filters.search);
    if (filters.type) params = params.set('type', filters.type);
    if (filters.collectionId) params = params.set('collectionId', filters.collectionId);
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    return params;
  }

  getContent(filters: ContentFilters = {}): Observable<ContentListResponse> {
    return this.http.get<ContentListResponse>(this.apiUrl, { params: this.buildParams(filters) });
  }

  getContentItem(id: string): Observable<Exercise> {
    return this.http.get<Exercise>(`${this.apiUrl}/${id}`);
  }

  createContent(content: Partial<Exercise>): Observable<Exercise> {
    return this.http.post<Exercise>(this.apiUrl, content);
  }

  updateContent(id: string, content: Partial<Exercise>): Observable<Exercise> {
    return this.http.patch<Exercise>(`${this.apiUrl}/${id}`, content);
  }

  deleteContent(id: string): Observable<ContentActionResponse> {
    return this.http.delete<ContentActionResponse>(`${this.apiUrl}/${id}`);
  }

  getUngroupedContent(filters: ContentFilters = {}): Observable<ContentListResponse> {
    return this.http.get<ContentListResponse>(`${this.apiUrl}/ungrouped`, { params: this.buildParams(filters) });
  }

  addToCollection(contentId: string, collectionId: string): Observable<Exercise> {
    return this.http.post<Exercise>(`${this.apiUrl}/${contentId}/collection/${collectionId}`, {});
  }

  removeFromCollection(contentId: string, collectionId: string): Observable<Exercise> {
    return this.http.delete<Exercise>(`${this.apiUrl}/${contentId}/collection/${collectionId}`);
  }
}
