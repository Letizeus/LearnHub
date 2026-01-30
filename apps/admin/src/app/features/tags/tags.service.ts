import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tag, TagGroup } from '@learnhub/models';

export interface TagGroupFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export interface TagGroupResponse {
  data: TagGroup[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class TagsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/admin/taggroups';

  getTagGroups(filters: TagGroupFilters = {}): Observable<TagGroupResponse> {
    const params: Record<string, string> = {};
    if (filters.search) params['search'] = filters.search;
    if (filters.page) params['page'] = filters.page.toString();
    if (filters.limit) params['limit'] = filters.limit.toString();

    return this.http.get<TagGroupResponse>(this.apiUrl, { params });
  }

  getTagGroup(id: string): Observable<TagGroup> {
    return this.http.get<TagGroup>(`${this.apiUrl}/${id}`);
  }

  createTagGroup(tagGroup: Partial<TagGroup>): Observable<TagGroup> {
    return this.http.post<TagGroup>(this.apiUrl, tagGroup);
  }

  updateTagGroup(id: string, tagGroup: Partial<TagGroup>): Observable<TagGroup> {
    return this.http.put<TagGroup>(`${this.apiUrl}/${id}`, tagGroup);
  }

  deleteTagGroup(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  addTag(tagGroupId: string, tag: Partial<Tag>): Observable<TagGroup> {
    return this.http.post<TagGroup>(`${this.apiUrl}/${tagGroupId}/tags`, tag);
  }

  updateTag(tagGroupId: string, tagId: string, tag: Partial<Tag>): Observable<TagGroup> {
    return this.http.put<TagGroup>(`${this.apiUrl}/${tagGroupId}/tags/${tagId}`, tag);
  }

  deleteTag(tagGroupId: string, tagId: string): Observable<TagGroup> {
    return this.http.delete<TagGroup>(`${this.apiUrl}/${tagGroupId}/tags/${tagId}`);
  }
}
