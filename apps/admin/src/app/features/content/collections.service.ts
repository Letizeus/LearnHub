import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LearningContentCollection, Status } from '@learnhub/models';

export interface CollectionFilters {
  search?: string;
  status?: Status | '';
  page?: number;
  limit?: number;
}

export interface CollectionResponse {
  data: LearningContentCollection[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root',
})
export class CollectionsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/admin/collections';

  getCollections(filters: CollectionFilters = {}): Observable<CollectionResponse> {
    const params: Record<string, string> = {};
    if (filters.search) params['search'] = filters.search;
    if (filters.status) params['status'] = filters.status;
    if (filters.page) params['page'] = filters.page.toString();
    if (filters.limit) params['limit'] = filters.limit.toString();

    return this.http.get<CollectionResponse>(this.apiUrl, { params });
  }

  getCollection(id: string): Observable<LearningContentCollection> {
    return this.http.get<LearningContentCollection>(`${this.apiUrl}/${id}`);
  }

  createCollection(collection: Partial<LearningContentCollection>): Observable<LearningContentCollection> {
    return this.http.post<LearningContentCollection>(this.apiUrl, collection);
  }

  updateCollection(id: string, collection: Partial<LearningContentCollection>): Observable<LearningContentCollection> {
    return this.http.patch<LearningContentCollection>(`${this.apiUrl}/${id}`, collection);
  }

  deleteCollection(id: string): Observable<{ success: boolean; message: string; id: string }> {
    return this.http.delete<{ success: boolean; message: string; id: string }>(`${this.apiUrl}/${id}`);
  }
}
