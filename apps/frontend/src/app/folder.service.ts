import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { catchError, filter, map, of, switchMap, tap } from 'rxjs';
import { ContentDataService } from './content-data.service';
import { HttpClient } from '@angular/common/http';
import { Exercise, Folder } from 'models';
import { MessageService } from 'primeng/api';
import { NavigationEnd, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class FolderService {
  private http = inject(HttpClient);
  private contentDataService = inject(ContentDataService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  private _folders = signal<Folder[]>([]);
  public readonly folders = this._folders.asReadonly();

  selectFolderId = signal<string | null>(null);
  activeFolder = computed(() => this.folders().find(f => f.id === this.selectFolderId()));
  folderContent = computed<Exercise[] | undefined>(() => {
    this.contentDataService.fetchMissingContent(this.activeFolder()?.content ?? []);
    return this.activeFolder()?.content.map(id => this.contentDataService.exercises().get(id)!);
  });

  likedFolder = computed(() => this.folders().find(f => f.id === 'liked')!);

  selectMode = signal<string>('');

  constructor() {
    this.fetchFolders();
    this.router.events.subscribe(() => this.selectMode.set(''));
  }

  fetchFolders() {
    return this.http.get<Folder[]>('/api/folder').subscribe({
      next: folders => {
        this._folders.set(folders);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: "Couldn't load folders. Please try again later." });
      },
    });
  }

  /*getFolderById(id: string) {
    const cachedItem = this._folders().find(c => c.id === id);

    if (cachedItem) return of(cachedItem);
    return this.fetchFolder(id);
  }*/

  updateFolder(id: string, changes: Partial<Folder>, errorMsg = "Couldn't perform update. Please try again later.") {
    this.http.put<Folder>(`/api/folder`, { ...changes, id }).subscribe({
      next: () => {
        this.fetchFolders();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: errorMsg });
      },
    });
  }

  addToFolder(id: string, folderId: string) {
    const folderToAdd = this._folders().find(f => f.id === folderId);
    if (!folderToAdd) {
      this.messageService.add({
        severity: 'error',
        summary: "Couldn't find folder to add to. Please try again later.",
      });
      return;
    }
    this.updateFolder(folderId, { content: [...(folderToAdd.content ?? []), id] });
  }

  removeFromFolder(id: string, folderId: string) {
    const folder = this._folders().find(f => f.id === folderId);
    if (!folder) {
      this.messageService.add({
        severity: 'error',
        summary: "Couldn't find folder to remove from. Please try again later.",
      });
      return;
    }
    this.updateFolder(folderId, { content: folder.content.filter(doc => doc !== id) });
  }

  isInFolder(id: string, folderId: string) {
    const folder = this._folders().find(f => f.id === folderId);
    if (!folder) return false;
    return folder.content?.includes(id) ?? false;
  }

  isInSelectedFolder(id: string) {
    return this.selectFolderId() ? this.isInFolder(id, this.selectFolderId()!) : false;
  }

  createNewFolder(name: string) {
    this.http.post<Folder>('/api/folder', { name }).subscribe({
      next: () => {
        this.fetchFolders();
        this.messageService.add({ severity: 'success', summary: 'Folder created successfully.' });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: "Couldn't create folder. Please try again later." });
      },
    });
  }

  deleteFolder(id: string) {
    this.http.delete(`/api/folder/${id}`, {}).subscribe({
      next: () => {
        this.fetchFolders();
        this.messageService.add({ severity: 'success', summary: 'Folder deleted successfully.' });
      },
      error: (err: any) => {
        this.messageService.add({ severity: 'error', summary: "Couldn't delete folder. Please try again later." });
      },
    });
  }

  like(id: string) {
    this.http.post(`/api/content/like/${id}`, {}).subscribe({
      next: like => {
        if (like) {
          this.addToFolder(id, 'liked');
        } else {
          this.removeFromFolder(id, 'liked');
        }
        this.contentDataService.refreshContent(id);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: "Couldn't like the content. Please try again later." });
      },
    });
  }
}
