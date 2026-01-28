import { computed, inject, Injectable, signal } from '@angular/core';
import { forkJoin, map, Observable, of, tap } from 'rxjs';
import { LearningContent } from './content-data.service';
import { HttpClient } from '@angular/common/http';

export enum TagVisibilityPlace {
  SEARCH_PAGE = 'SEARCH_PAGE',
  TAG_SELECT = 'TAG_SELECT',
}

export interface TagVisibility {
  place: TagVisibilityPlace;
  position?: number;
}

export interface TagGroup {
  id: TagID;
  name: string;
  icon?: string;
  tags: TagID[];
  visibility: TagVisibility[];
}

export interface TagGroupPopulated extends Omit<TagGroup, 'tags'> {
  tags: Tag[];
}

export interface Tag {
  id: TagID;
  name: string;
  icon?: string;
  color?: string;
  backgroundImage?: string;
}

export type TagID = string;

@Injectable({
  providedIn: 'root',
})
export class TagService {
  private http = inject(HttpClient);

  private _tagGroups = signal<Map<TagID, TagGroup>>(new Map());
  public readonly tagGroups = this._tagGroups.asReadonly();
  public readonly tagGroupsArray = computed<TagGroup[]>(() => Array.from(this._tagGroups().values()));

  private _tags = signal<Map<TagID, Tag>>(new Map());
  public readonly tags = this._tags.asReadonly();

  constructor() {}

  private fetchTag(id: TagID) {
    return this.http.get<Tag>(`/api/tag/${id}`).pipe(
      tap(content => {
        this._tags.update(contents => {
          const newMap = new Map(contents);
          newMap.set(content.id, content);
          return newMap;
        });
      })
    );
  }

  getTagById(id: TagID) {
    const cachedItem = this._tags().get(id);

    if (cachedItem) return of(cachedItem);
    return this.fetchTag(id);
  }

  private fetchTagGroup(id: TagID) {
    return this.http.get<TagGroup>(`/api/tag/groups/${id}`).pipe(
      tap(content => {
        this._tagGroups.update(contents => {
          const newMap = new Map(contents);
          newMap.set(content.id, content);
          return newMap;
        });
      })
    );
  }

  private fetchTagGroupsFromVisibility(visibility: TagVisibilityPlace, cachedItems: TagID[] = []) {
    return this.http
      .get<TagGroup[]>(`/api/tag/groups`, {
        params: {
          visibility,
          exclude: cachedItems.join(','),
        },
      })
      .pipe(
        tap(content => {
          this._tagGroups.update(contents => {
            const newMap = new Map(contents);
            content.forEach(group => newMap.set(group.id, group));
            return newMap;
          });
        })
      );
  }

  getTagGroupById(id: TagID) {
    const cachedItem = this._tagGroups().get(id);

    if (cachedItem) return of(cachedItem);
    return this.fetchTagGroup(id);
  }

  getTagGroupsByVisibility(visibility: TagVisibilityPlace) {
    const cachedItems = Array.from(this._tagGroups().values())
      .filter(group => group.visibility.some(v => v.place === visibility))
      .map(group => group.id as TagID);

    return this.fetchTagGroupsFromVisibility(visibility, cachedItems);
  }

  populateTagGroup(group: TagGroup): Observable<TagGroupPopulated> {
    if (!group.tags?.length) {
      return of({
        id: group.id,
        name: group.name,
        icon: group.icon,
        visibility: group.visibility,
        tags: [],
      });
    }

    const tagStreams = group.tags.map(tagId => this.getTagById(tagId));

    return forkJoin(tagStreams).pipe(
      map(
        (tags): TagGroupPopulated => ({
          id: group.id,
          name: group.name,
          icon: group.icon,
          visibility: group.visibility,
          tags,
        })
      )
    );
  }
}
