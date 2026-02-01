import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom, forkJoin, map, Observable, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Tag, TagGroup, TagID, TagVisibilityPlace } from 'models';

export interface TagGroupPopulated extends Omit<TagGroup, 'tags'> {
  tags: Tag[];
}

@Injectable({
  providedIn: 'root'
})
export class TagService {
  private http = inject(HttpClient);

  private _tagGroups = signal<Map<string, TagGroup>>(new Map());
  public readonly tagGroups = this._tagGroups.asReadonly();
  public readonly tagGroupsArray = computed<TagGroup[]>(() => Array.from(this._tagGroups().values()));
  public readonly tagGroupsPopulated = computed<TagGroupPopulated[]>(() =>
    this.tagGroupsArray().map(group => ({ ...group, tags: group.tags.map(tagId => this.tags().get(tagId)!) }))
  );

  private _tags = signal<Map<string, Tag>>(new Map());
  public readonly tags = this._tags.asReadonly();

  constructor() {
  }

  async init() {
    this.fetchTagGroupsFromVisibility(TagVisibilityPlace.SEARCH_PAGE);
    this.fetchTagGroupsFromVisibility(TagVisibilityPlace.TAG_SELECT);
  }

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

  private fetchTagGroupsFromVisibility(visibility: TagVisibilityPlace) {
    this.http
      .post<TagGroupPopulated[]>(`/api/tag/groups`, { visibilityPlace: visibility })
      /*.pipe(
        map((res: any): TagGroup[] => {
          if (Array.isArray(res)) return res as TagGroup[];
          if (res?.items && Array.isArray(res.items)) return res.items as TagGroup[];
          if (res && typeof res === 'object') return Object.values(res as Record<string, TagGroup>);
          return [];
        }),
        tap(groups => {
          this._tagGroups.update(contents => {
            const newMap = new Map(contents);
            groups.forEach(group => newMap.set(group.id, group));
            return newMap;
          });
        }),
      )*/
      .subscribe({
        next: result => {
          this.addToGroupHelper(result.map(e => ({ ...e, tags: e.tags.map(e2 => e2.id) })));
          this.addToTagsHelper(result.flatMap(e => e.tags));
        }
      });
  }

  private addToGroupHelper(groups: TagGroup[]) {
    this._tagGroups.update(prev => {
      const next = new Map(prev);
      groups.forEach(item => next.set(item.id, item));
      return next;
    });
  }

  private addToTagsHelper(tags: Tag[]) {
    this._tags.update(prev => {
      const next = new Map(prev);
      tags.forEach(item => next.set(item.id, item));
      return next;
    });
  }

  getTagGroupById(id: TagID) {
    const cachedItem = this._tagGroups().get(id);

    if (cachedItem) return of(cachedItem);
    return this.fetchTagGroup(id);
  }

  getTagGroupsByVisibility(visibility: TagVisibilityPlace) {
    const cachedItems = Array.from(this._tagGroups().values())
      .filter(group => {
        const vis: any = (group as any).visibility;
        if (!Array.isArray(vis)) return false; // handle undefined/null/non-array
        return vis.some((v: any) => (typeof v === 'string' ? v === visibility : v?.place === visibility));
      })
      .map(group => group.id as TagID);

    return this.fetchTagGroupsFromVisibility(visibility);
  }

  /*populateTagGroup(group: TagGroup): Observable<TagGroupPopulated> {
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
        }),
      ),
    );
  }*/
}
