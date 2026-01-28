import { signal } from '@angular/core';

export class CachedSignal<T> {
  private data = signal<T | null>(null);
  private lastFetch = 0;

  constructor(private ttl: number) {}

  // Check if data is still valid
  get isExpired(): boolean {
    return !this.data() || Date.now() - this.lastFetch > this.ttl;
  }

  get value() {
    return this.data.asReadonly();
  }

  update(newValue: T) {
    this.data.set(newValue);
    this.lastFetch = Date.now();
  }
}
