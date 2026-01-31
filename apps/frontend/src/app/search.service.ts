import { computed, Injectable, signal } from '@angular/core';
import { SearchQuery } from 'models';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  // SEARCH
  searchQuery = signal<SearchQuery | null>(null);
  searchResults = computed(() => {});

  constructor() {}

  updateSearchQuery(query: SearchQuery) {
    this.searchQuery.set(query);
  }
}
