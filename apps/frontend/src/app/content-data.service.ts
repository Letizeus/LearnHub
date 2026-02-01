import { computed, effect, inject, Injectable, resource, signal, untracked } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, debounceTime, distinctUntilChanged, filter, firstValueFrom, map, of, startWith, switchMap, take, tap } from 'rxjs';
import { Exercise, LearningContent, LearningContentCollection, SearchQuery, SearchResult, SearchResultPopulated } from 'models';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

function isExercise(lc: LearningContent): lc is Exercise {
  return lc.type === 'EXERCISE';
}

@Injectable({
  providedIn: 'root',
})
export class ContentDataService {
  // INJECTIONS
  private http = inject(HttpClient);
  private messageService = inject(MessageService);
  private router = inject(Router);

  // STORE
  private _learningContent = signal<Map<string, LearningContent>>(new Map());
  public readonly learningContent = this._learningContent.asReadonly();

  private _learningContentCollections = signal<Map<string, LearningContentCollection>>(new Map());
  public readonly learningContentCollections = this._learningContentCollections.asReadonly();

  public readonly exercises = computed<Map<string, Exercise>>(() => {
    const map = this._learningContent() as Map<string, LearningContent>;

    const entries = [...map.entries()].filter(([, item]) => isExercise(item)) as Array<[string, Exercise]>;

    return new Map<string, Exercise>(entries);
  });

  // DETAILED
  selectedId = signal<string | null>(null);
  activeExercise = computed(() => this.exercises().get(this.selectedId()!));

  similarExercisesIds = signal<string[]>([]);
  similarExercises = computed<Exercise[]>(() => {
    return this.similarExercisesIds().map(e => this.exercises().get(e)!);
  });

  // Recommendations
  recommendedCollectionstIds = signal<string[]>([]);
  recommendedCollections = computed<LearningContentCollection[]>(() => {
    return this.recommendedCollectionstIds().map(e => this._learningContentCollections().get(e)!);
  });

  trendingContentIds = signal<string[]>([]);
  trendingContent = computed<Exercise[]>(() => {
    return this.trendingContentIds().map(e => this.exercises().get(e)!);
  });

  recentCollectionsIds = signal<string[]>([]);
  recentCollections = computed<LearningContentCollection[]>(() => {
    return this.recentCollectionsIds().map(e => this._learningContentCollections().get(e)!);
  });

  // SEARCH

  searchQuery = toSignal<SearchQuery>(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      startWith(null),
      map(() => {
        const params = this.router.routerState.snapshot.root.queryParams;
        return {
          query: params['q'] || '',
          tags: params['t']?.split(',') ?? undefined,
          collection: params['c'] || undefined,
        };
      }),
    ),
  );

  private searchResults$ = toObservable(this.searchQuery).pipe(
    filter(query => !!query),
    debounceTime(1000),
    distinctUntilChanged(),
    switchMap(query => this.getContentBySearch(query!)),
    tap(result => {
      if (result) {
        this.fetchMissingContent(result.exercises.items);
        this.fetchMissingCollections(result.collections.items);
      }
    }),
  );

  searchResults = toSignal(this.searchResults$);

  searchResultsPopulated = computed<SearchResultPopulated>(() => {
    if (!this.searchResults())
      return {
        collections: { items: [], length: 0 },
        exercises: { items: [], length: 0 },
      };
    return {
      collections: {
        items: this.searchResults()!.collections.items.map((e: string) => this._learningContentCollections().get(e)),
        length: this.searchResults()!.collections.length,
      },
      exercises: {
        items: this.searchResults()!.exercises.items.map((e: string) => this.exercises().get(e)),
        length: this.searchResults()!.exercises.length,
      },
    };
  });

  constructor() {
    this.getTrendingContent();
    this.getRecentCollections();
    this.getRecommendedCollections();
    effect(() => {
      if (this.selectedId()) {
        this.getSimilarContent();
        this.fetchMissingContent([this.selectedId()!]);
      }
    });
  }

  private addContentHelper(content: LearningContent[]) {
    this._learningContent.update(prev => {
      const next = new Map(prev); // New reference
      content.forEach(item => {
        // Use a fallback or check the actual property name from your API
        const key = item.id || (item as any)._id;
        if (key) {
          next.set(key, item);
        } else {
          console.error('Content item missing ID:', item);
        }
      });
      return next; // Angular sees a different reference and triggers
    });
  }

  private addCollectionsHelper(collections: LearningContentCollection[]) {
    this._learningContentCollections.update(prev => {
      const next = new Map(prev); // New reference
      collections.forEach(item => next.set(item.id, item));
      return next; // Angular sees a different reference and triggers
    });
  }

  fetchMissingContent(ids: string[]) {
    const cache = this._learningContent();
    const missingIds = ids.filter(id => !cache.get(id));
    if (missingIds.length === 0) return;
    this.http
      .post<LearningContent[]>('/api/content/contents', { missingIds })
      .pipe(take(1))
      .subscribe({
        next: contents => {
          this.addContentHelper(contents);
        },
        error: err => {
          console.error(err);
          this.messageService.add({
            severity: 'error',
            summary: "Couldn't load missing content. Please try again later.",
          });
        },
      });
  }

  fetchMissingCollections(ids: string[]) {
    const cache = this._learningContentCollections();
    const missingIds = ids.filter(id => !cache.get(id));
    if (missingIds.length === 0) return;
    this.http
      .post<LearningContentCollection[]>('/api/content/collections/', { missingIds })
      .pipe(take(1))
      .subscribe({
        next: collections => {
          this.addCollectionsHelper(collections);
        },
        error: err => {
          console.error(err);
          this.messageService.add({
            severity: 'error',
            summary: "Couldn't load missing collections. Please try again later.",
          });
        },
      });
  }

  download(id: string) {
    this.http
      .post('/api/content/download/' + id, {})
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.refreshContent(id);
        },
      });
  }

  refreshContent(id: string) {
    this._learningContent.update(prev => {
      const map = prev;
      map.delete(id);
      return map;
    });
    this.fetchMissingContent([id]);
  }

  getContentBySearch(query: SearchQuery) {
    return this.http.post<SearchResult>('/api/content/search', query);
  }

  getRecommendedCollections() {
    this.http
      .get<string[]>('/api/content/recommendations/collections')
      .pipe(take(1))
      .subscribe({
        next: ids => {
          this.recommendedCollectionstIds.set(ids);
          this.fetchMissingCollections(ids);
        },
        error: err => {
          console.error(err);
          this.messageService.add({
            severity: 'error',
            summary: "Couldn't load recommended collections. Please try again later.",
          });
        },
      });
  }

  getTrendingContent() {
    this.http
      .get<string[]>('/api/content/recommendations/trending')
      .pipe(take(1))
      .subscribe({
        next: ids => {
          this.trendingContentIds.set(ids);
          this.fetchMissingContent(ids);
        },
        error: err => {
          console.error(err);
          this.messageService.add({
            severity: 'error',
            summary: "Couldn't load trending content. Please try again later.",
          });
        },
      });
  }

  getRecentCollections() {
    this.http
      .get<string[]>('/api/content/recommendations/recent')
      .pipe(take(1))
      .subscribe({
        next: ids => {
          this.recentCollectionsIds.set(ids);
          this.fetchMissingCollections(ids);
        },
        error: err => {
          console.error(err);
          this.messageService.add({
            severity: 'error',
            summary: "Couldn't load recent collections. Please try again later.",
          });
        },
      });
  }

  getSimilarContent() {
    this.http
      .get<string[]>('/api/content/recommendations/similar', {
        params: {
          id: this.selectedId()!,
        },
      })
      .pipe(take(1))
      .subscribe({
        next: ids => {
          this.similarExercisesIds.set(ids);
          this.fetchMissingContent(ids);
        },
        error: err => {
          console.error(err);
          this.messageService.add({
            severity: 'error',
            summary: "Couldn't load similar collections. Please try again later.",
          });
        },
      });
  }
}
