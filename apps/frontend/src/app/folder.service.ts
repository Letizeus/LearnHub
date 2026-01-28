import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { ContentDataService, LearningContent } from './content-data.service';
import { HttpClient } from '@angular/common/http';
import { LHMessage } from './toast.service';

export type Folder = {
  id: string;
  name: string;
  icon?: string;
  documents: string[];
};

@Injectable({
  providedIn: 'root',
})
export class FolderService {
  private http = inject(HttpClient);
  private contentDataService = inject(ContentDataService);

  private _folders = signal<Folder[]>([
    {
      id: 'liked',
      name: 'Liked',
      icon: 'star',
      documents: ['0', '1', '2', '3'],
    },
    {
      id: '0',
      name: 'Test 1',
      documents: ['0', '1', '2', '3'],
    },
    {
      id: '1',
      name: 'Test 2',
      documents: ['0', '1', '2', '3'],
    },
    {
      id: '2',
      name: 'Test 3',
      documents: ['0', '1', '2', '3'],
    },
  ]);
  public readonly folders = this._folders.asReadonly();

  selectFolder = signal<string | null>(null);
  activeFolder = computed(() => this.folders().find(f => f.id === this.selectFolder()));
  folderContent = computed(() => this.contentDataService.exercises().filter(e => e.id in this.activeFolder()!.documents || []));

  likedFolder = computed(() => this.folders().find(f => f.id === 'liked')!);

  // Error
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

  constructor() {}

  fetchFolder(id: string) {
    return this.http.get<Folder>(`/api/folder/${id}`).pipe(
      tap(folder => {
        this._folders.update(folders => [...folders, folder]);
      })
    );
  }

  getFolderById(id: string) {
    const cachedItem = this._folders().find(c => c.id === id);

    if (cachedItem) return of(cachedItem);
    return this.fetchFolder(id);
  }

  updateFolder(id: string, changes: Partial<Folder>, errorMsg = "Couldn't perform update. Please try again later.") {
    this.getFolderById(id).pipe(
      switchMap(item => {
        const payload = { ...item, ...changes };

        return this.http.put<Folder>(`/api/folder/${id}`, payload).pipe(
          tap(savedItem => {
            this._folders.update(folders => folders.map(c => (c.id === id ? savedItem : c)));
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

  addToFolder(id: string, folderId: string) {
    this.getFolderById(folderId).pipe(
      tap(folder => {
        this.updateFolder(folderId, { documents: [...folder.documents, id] });
      })
    );
  }

  removeFromFolder(id: string, folderId: string) {
    this.getFolderById(folderId).pipe(
      tap(folder => {
        this.updateFolder(folderId, { documents: folder.documents.filter(doc => doc !== id) });
      })
    );
  }

  isInFolder(id: string, folderId: string) {
    return this.getFolderById(folderId).pipe(map(folder => folder?.documents.includes(id) || false));
  }

  createNewFolder(name: string) {
    return this.http.post<Folder>('/api/folder', { name }).pipe(
      tap(folder => {
        this._folders.update(folders => [...folders, folder]);
      }),
      map(folder => folder.id),
      catchError(err => {
        this.error.update(c => [
          ...c,
          {
            msg: "Couldn't create new folder. Please try again later.",
            error: err,
            time: new Date(),
          },
        ]);
        return of(null);
      })
    );
  }

  deleteFolder(id: string) {
    const oldState = this._folders();

    this._folders.update(folders => folders.filter(f => f.id !== id));

    this.http.delete(`/api/folder/${id}`, {}).subscribe({
      error: (err: any) => {
        this._folders.update(folders => oldState);
        this.error.update(c => [
          ...c,
          {
            msg: "Couldn't remove Folder. Please try again later.",
            error: err,
            time: new Date(),
          },
        ]);
      },
    });
  }
}
