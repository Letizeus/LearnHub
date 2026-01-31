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

export interface TagResponse {
  data: Tag[];
  total: number;
}

export interface TagFilters {
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root',
})
export class TagsService {
  private readonly http = inject(HttpClient);
  private readonly tagGroupsUrl = 'http://localhost:3000/api/admin/taggroups';
  private readonly tagsUrl = 'http://localhost:3000/api/admin/tags';

  private buildParams(filters: TagFilters | TagGroupFilters): Record<string, string> {
    const params: Record<string, string> = {};
    if (filters.search) params['search'] = filters.search;
    if (filters.page) params['page'] = filters.page.toString();
    if (filters.limit) params['limit'] = filters.limit.toString();
    return params;
  }

  // Tag Group operations
  getTagGroups(filters: TagGroupFilters = {}): Observable<TagGroupResponse> {
    return this.http.get<TagGroupResponse>(this.tagGroupsUrl, { params: this.buildParams(filters) });
  }

  getTagGroup(id: string): Observable<TagGroup> {
    return this.http.get<TagGroup>(`${this.tagGroupsUrl}/${id}`);
  }

  createTagGroup(tagGroup: Partial<TagGroup>): Observable<TagGroup> {
    return this.http.post<TagGroup>(this.tagGroupsUrl, tagGroup);
  }

  updateTagGroup(id: string, tagGroup: Partial<TagGroup>): Observable<TagGroup> {
    return this.http.put<TagGroup>(`${this.tagGroupsUrl}/${id}`, tagGroup);
  }

  deleteTagGroup(id: string): Observable<void> {
    return this.http.delete<void>(`${this.tagGroupsUrl}/${id}`);
  }

  // Tag operations (standalone)
  getTags(filters: TagFilters = {}): Observable<TagResponse> {
    return this.http.get<TagResponse>(this.tagsUrl, { params: this.buildParams(filters) });
  }

  getTag(id: string): Observable<Tag> {
    return this.http.get<Tag>(`${this.tagsUrl}/${id}`);
  }

  createTag(tag: Partial<Tag>): Observable<Tag> {
    return this.http.post<Tag>(this.tagsUrl, tag);
  }

  updateTag(tagId: string, tag: Partial<Tag>): Observable<Tag> {
    return this.http.put<Tag>(`${this.tagsUrl}/${tagId}`, tag);
  }

  deleteTag(tagId: string): Observable<void> {
    return this.http.delete<void>(`${this.tagsUrl}/${tagId}`);
  }

  getUngroupedTags(filters: TagFilters = {}): Observable<TagResponse> {
    return this.http.get<TagResponse>(`${this.tagsUrl}/ungrouped`, { params: this.buildParams(filters) });
  }

  // Tag-Group association operations
  addTagToGroup(tagGroupId: string, tagId: string): Observable<TagGroup> {
    return this.http.post<TagGroup>(`${this.tagGroupsUrl}/${tagGroupId}/tags`, { tagId });
  }

  removeTagFromGroup(tagGroupId: string, tagId: string): Observable<TagGroup> {
    return this.http.delete<TagGroup>(`${this.tagGroupsUrl}/${tagGroupId}/tags/${tagId}`);
  }
}
