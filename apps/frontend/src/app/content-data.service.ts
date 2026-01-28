import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { FolderService } from './folder.service';
import { HttpClient } from '@angular/common/http';
import { catchError, debounceTime, map, of, switchMap, tap } from 'rxjs';
import { LHMessage } from './toast.service';
import { Tag, TagID } from './tag.service';

export interface LearningAnalytics {
  interactions: {
    type: 'VIEW' | 'PDF-CREATOR' | 'DOWNLOAD';
    user: string;
    time: number;
  }[];
  searchKeywords: string[];
}

export interface LearningContentCollection {
  id: string;
  title: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  source: {
    url?: string;
    publishedAt?: Date;
    publisher?: string;
    organisation?: string;
  };
  previewImage?: string;
  length: number;
  author: string;
  createdAt: Date;
  changedAt: Date;
  contents: LearningContent[];
}

export interface LearningContent {
  id: string;
  type: string;
  keywords: string;
  downloads: number;
  likes: number;
  tags: string[];
  relatedCollection: LearningContentCollection;
  analytics: LearningAnalytics;
}

export interface SearchQuery {
  query: string;
  tags?: TagID[];
}

export interface SearchResult {
  exercises: {
    items: Exercise[];
    length: number;
  };
  collections: {
    items: LearningContentCollection[];
    length: number;
  };
}

export interface Exercise extends LearningContent {
  type: 'EXERCISE';
  text: string;
  images?: string[];
  tip?: string;
  solution?: string;
  solutionImages?: string[];
  eval_points?: number;
  total_points?: number;
}

const parentCollection: LearningContentCollection = {
  id: 'coll-001',
  title: 'Advanced Mathematics and Physics 2026',
  status: 'PUBLISHED',
  length: 2,
  source: {
    url: 'https://edu-portal.example.com/physics-101',
    publishedAt: new Date('2026-01-10'),
    publisher: 'Global Learning Press',
    organisation: 'Science Academy',
  },
  author: 'Dr. Jane Smith',
  createdAt: new Date('2025-12-01'),
  changedAt: new Date('2026-01-11'),
  contents: [], // This would be populated with the exercises below
};

function isExercise(lc: LearningContent): lc is Exercise {
  return lc.type === 'EXERCISE';
}

@Injectable({
  providedIn: 'root',
})
export class ContentDataService {
  // INJECTIONS
  private http = inject(HttpClient);

  // STORE
  private _learningContent = signal<LearningContent[]>([]);
  public readonly learningContent = this._learningContent.asReadonly();

  private _learningContentCollections = signal<LearningContentCollection[]>([]);
  public readonly learningContentCollections = this._learningContentCollections.asReadonly();

  public readonly exercises = computed<Exercise[]>(() => this._learningContent().filter(isExercise));

  /*exercises: Exercise[] = Array.from({ length: 20 }, (_, i) => {
    const id = i.toString();

    return {
      // LearningContent properties
      id: id,
      keywords: `education, lesson-${id}, science`,
      downloads: Math.floor(Math.random() * 100),
      likes: Math.floor(Math.random() * 50),
      relatedCollection: parentCollection,
      analytics: {
        interactions: [
          {
            type: i % 3 === 0 ? 'VIEW' : i % 3 === 1 ? 'DOWNLOAD' : 'PDF-CREATOR',
            user: `user_${Math.floor(Math.random() * 1000)}`,
            time: Date.now() - Math.floor(Math.random() * 1000000),
          },
        ],
        searchKeywords: ['problem solving', 'tutorial', `topic-${id}`],
      },

      // Exercise properties
      text: `This is the problem statement for exercise #${id}. Calculate the value of $x$ given the constraints.`,
      images: [`https://placehold.co/600x400?text=Exercise+${id}`],
      tip: 'Remember to check your units before finalizing the calculation.',
      solution: `The solution for exercise #${id} is derived using the standard formula $E = mc^2$.`,
      solutionImages: [`https://placehold.co/600x400?text=Solution+${id}`],
      eval_points: 5,
      total_points: 10,
    };
  });
  collections = [parentCollection];
  institutions = [{ id: 'test' }];*/

  public readonly searchCache = signal<Map<SearchQuery, SearchResult>>(new Map());
  searchQuery = signal<SearchQuery | null>(null);
  searchResults = computed<SearchResult>(() => {
    if (this.searchQuery()) {
      if (this.searchCache().has(this.searchQuery()!)) return this.searchCache().get(this.searchQuery()!)!;
    }
    return {
      exercises: {
        items: [],
        length: 0,
      },
      collections: {
        items: [],
        length: 0,
      },
    };
  });

  // DETAILED
  selectedId = signal<string | null>(null);
  activeExercise = computed(() => this.exercises().find(e => e.id === this.selectedId()));

  // ERROR
  error = signal<
    {
      msg: string;
      error: any;
      time: Date;
    }[]
  >([]);
  messages = computed<LHMessage[]>(() =>
    this.error().map(({ msg, error, time }) => ({
      message: msg,
      severity: 'error',
      time,
    }))
  );
  latestError = computed(() => this.error().slice(-1)[0]);

  // Recommendations
  recommendedContent = computed<LearningContentCollection[]>(() => []);
  trendingContent = computed<Exercise[]>(() => []);
  recentCollections = computed<LearningContentCollection[]>(() => []);

  constructor() {
    effect(() => {
      if (this.searchQuery()) this.getContentBySearch(this.searchQuery()!).pipe(debounceTime(1000)).subscribe();
    });
  }

  private fetchContent(id: string) {
    return this.http.get<LearningContent>(`/api/content/${id}`).pipe(
      tap(content => {
        this._learningContent.update(contents => [...contents, content]);
      })
    );
  }

  getContentById(id: string) {
    const cachedItem = this._learningContent().find(c => c.id === id);

    if (cachedItem) return of(cachedItem);
    return this.fetchContent(id);
  }

  updateContent(id: string, changes: Partial<LearningContent>, errorMsg = "Couldn't perform update. Please try again later.") {
    this.getContentById(id).pipe(
      switchMap(item => {
        const payload = { ...item, ...changes };

        return this.http.put<LearningContent>(`/api/content/${id}`, payload).pipe(
          tap(savedItem => {
            this._learningContent.update(contents => contents.map(c => (c.id === id ? savedItem : c)));
          })
        );
      }),
      catchError(err => {
        this.error.update(c => [
          ...c,
          {
            msg: errorMsg,
            error: err,
            time: new Date(),
          },
        ]);
        return of(null);
      })
    );
  }

  getContentBySearch(query: SearchQuery) {
    if (this.searchCache().has(query)) return of(this.searchCache().get(query));
    return this.http.post<SearchResult>('/api/search', query).pipe(
      tap(result => {
        this._learningContent.update(contents => [...contents, ...result.exercises.items]);
        this._learningContentCollections.update(collections => [...collections, ...result.collections.items]);
        this.searchCache.update(cache => {
          const newCache = new Map(cache);
          newCache.set(query, result);
          return newCache;
        });
      })
    );
  }

  addLike(id: string) {
    this.getContentById(id).pipe(
      tap(content => {
        this.updateContent(id, { likes: content.likes + 1 }, "Couldn't like the content. Please try again later.");
      })
    );
  }

  removeLike(id: string) {
    this.getContentById(id).pipe(tap(content => this.updateContent(id, { likes: content.likes - 1 })));
  }
}
