import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LearningContentCollection } from '@learnhub/models';

export interface CoursesListResponse {
  data: LearningContentCollection[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CourseFilters {
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CourseActionResponse {
  id: string;
  success?: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CoursesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/admin/courses';

  getCourses(filters: CourseFilters = {}): Observable<CoursesListResponse> {
    let params = new HttpParams();

    if (filters.search) params = params.set('search', filters.search);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder)
      params = params.set('sortOrder', filters.sortOrder);
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());

    return this.http.get<CoursesListResponse>(this.apiUrl, { params });
  }

  getCourse(id: string): Observable<LearningContentCollection> {
    return this.http.get<LearningContentCollection>(`${this.apiUrl}/${id}`);
  }

  deleteCourse(id: string): Observable<CourseActionResponse> {
    return this.http.delete<CourseActionResponse>(`${this.apiUrl}/${id}`);
  }
}
