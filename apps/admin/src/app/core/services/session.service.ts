// TEMP: Uses browser localStorage. Needs to be replaced with a real authentication system.
import { Injectable, Signal, computed, signal } from '@angular/core';
import { UserSession } from '@learnhub/models';

// Key used to save/load session from browser storage
const STORAGE_KEY = 'admin_session';

/**
 * Manages admin authentication state using Angular signals.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  // The actual data or null if logged out
  private readonly _session = signal<UserSession | null>(
    this.loadFromBrowser()
  );

  // Same data but read-only (other code can read, but can't accidentally overwrite)
  readonly session: Signal<UserSession | null> = computed(() =>
    this._session()
  );

  // Get just the user info, or null if not logged in
  user(): UserSession['user'] | null {
    return this._session()?.user ?? null;
  }

  // Get just the token, or null if not logged in
  token(): string | null {
    return this._session()?.token ?? null;
  }

  // Called after successful login: saves session to memory + browser storage
  set(session: UserSession): void {
    this._session.set(session);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  // Called on logout: removes session from memory + browser storage
  clear(): void {
    this._session.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  // On app start, check if user was already logged in
  private loadFromBrowser(): UserSession | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserSession;
    } catch {
      return null;
    }
  }
}
