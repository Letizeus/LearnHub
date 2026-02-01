import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { LearningContentCollection, LearningContent, Exercise, Status, Tag } from '@learnhub/models';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { CollectionsService, CollectionFilters } from './collections.service';
import { ContentService } from './content.service';
import { TagsService } from '../tags/tags.service';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    ConfirmDialogModule,
    DialogModule,
    InputTextModule,
    MultiSelectModule,
    TextareaModule,
    SelectModule,
    ToastModule,
    TooltipModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentComponent {
  private readonly collectionsService = inject(CollectionsService);
  private readonly contentService = inject(ContentService);
  private readonly tagsService = inject(TagsService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  // Collections (Left panel) state
  readonly collections = signal<LearningContentCollection[]>([]);
  readonly selectedCollection = signal<LearningContentCollection | null>(null);
  readonly showingUngrouped = signal(false);
  readonly ungroupedContent = signal<Exercise[]>([]);
  readonly collectionSearchQuery = signal('');
  readonly collectionStatusFilter = signal<Status | ''>('');
  readonly collectionDialogVisible = signal(false);
  readonly collectionEditMode = signal(false);
  readonly collectionForm = signal<Partial<LearningContentCollection>>({});

  // Contents (Right panel) state
  readonly contentDialogVisible = signal(false);
  readonly editingContent = signal<Exercise | null>(null);
  readonly contentForm = signal<Partial<Exercise>>({});

  // Add to Collection dialog
  readonly addToCollectionDialogVisible = signal(false);
  readonly selectedContentForCollection = signal<Exercise | null>(null);
  readonly selectedCollectionIds = signal<string[]>([]);
  readonly availableCollectionsForContent = signal<LearningContentCollection[]>([]);

  // Tags
  readonly availableTags = signal<Tag[]>([]);
  readonly selectedTags = signal<Tag[]>([]);

  // Options
  readonly statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Draft', value: Status.DRAFT },
    { label: 'Published', value: Status.PUBLISHED },
    { label: 'Archived', value: Status.ARCHIVED },
  ];

  readonly contentTypeOptions = [
    { label: 'Exercise', value: 'EXERCISE' },
  ];

  constructor() {
    this.loadCollections();
    this.loadAvailableTags();
  }

  // ========== Collection Operations ==========

  onCollectionSearch(): void {
    this.loadCollections();
  }

  onStatusFilterChange(): void {
    this.loadCollections();
  }

  selectCollection(collection: LearningContentCollection): void {
    this.showingUngrouped.set(false);
    this.collectionsService.getCollection(collection.id).subscribe({
      next: (detailedCollection) => {
        this.selectedCollection.set(detailedCollection);
      },
      error: (err) => {
        console.error('Failed to load collection details:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load collection details',
        });
      },
    });
  }

  selectUngrouped(): void {
    this.showingUngrouped.set(true);
    this.selectedCollection.set(null);
    this.loadUngroupedContent();
  }

  openCreateCollectionDialog(): void {
    this.collectionEditMode.set(false);
    this.collectionForm.set({
      title: '',
      status: Status.DRAFT,
      author: '',
    });
    this.collectionDialogVisible.set(true);
  }

  openEditCollectionDialog(collection: LearningContentCollection): void {
    this.collectionEditMode.set(true);
    this.collectionForm.set({ ...collection });
    this.collectionDialogVisible.set(true);
  }

  closeCollectionDialog(): void {
    this.collectionDialogVisible.set(false);
  }

  onCollectionDialogHide(): void {
    this.collectionForm.set({});
  }

  saveCollection(): void {
    const form = this.collectionForm();
    if (!form.title || !form.author || !form.status) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Title, author, and status are required',
      });
      return;
    }

    if (this.collectionEditMode() && !form.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Collection ID is missing',
      });
      return;
    }

    const operation = this.collectionEditMode() && form.id
      ? this.collectionsService.updateCollection(form.id, form)
      : this.collectionsService.createCollection(form);

    operation.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Collection ${this.collectionEditMode() ? 'updated' : 'created'} successfully`,
        });
        this.closeCollectionDialog();
        this.loadCollections();
      },
      error: (err) => {
        console.error('Failed to save collection:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save collection',
        });
      },
    });
  }

  deleteCollection(collection: LearningContentCollection): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this collection? This action cannot be undone.',
      header: 'Delete Collection',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.collectionsService.deleteCollection(collection.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Collection deleted successfully',
            });
            if (this.selectedCollection()?.id === collection.id) {
              this.selectedCollection.set(null);
            }
            this.loadCollections();
          },
          error: (err) => {
            console.error('Failed to delete collection:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete collection',
            });
          },
        });
      },
    });
  }

  // ========== Content Operations ==========

  openAddContentDialog(): void {
    this.editingContent.set(null);
    this.selectedTags.set([]);
    this.contentForm.set({
      type: 'EXERCISE',
      text: '',
      tip: '',
      solution: '',
      eval_points: 0,
      total_points: 0,
      relatedCollectionId: this.showingUngrouped() ? undefined : this.selectedCollection()?.id,
      tags: [],
    });
    this.contentDialogVisible.set(true);
  }

  openEditContentDialog(content: Exercise): void {
    this.editingContent.set(content);

    const matchedTags = (content.tags || []).map(tag =>
      this.availableTags().find(t => t.name === tag.name) || tag
    );
    this.selectedTags.set(matchedTags);

    this.contentForm.set({ ...content });
    this.contentDialogVisible.set(true);
  }

  closeContentDialog(): void {
    this.contentDialogVisible.set(false);
  }

  onContentDialogHide(): void {
    this.contentForm.set({});
    this.editingContent.set(null);
  }

  saveContent(): void {
    const form = this.contentForm();
    const editing = this.editingContent();

    if (!form.text || form.text.length < 10) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Content text is required and must be at least 10 characters',
      });
      return;
    }

    if (editing && !editing.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Content ID is missing',
      });
      return;
    }

    const tags = this.selectedTags()
      .filter(tag => tag && tag.name)
      .map(tag => ({
        name: tag.name,
        ...(tag.icon && { icon: tag.icon }),
        ...(tag.color && { color: tag.color }),
        ...(tag.backgroundImage && { backgroundImage: tag.backgroundImage }),
      }));

    const contentData: Partial<Exercise> = {
      type: form.type,
      text: form.text,
      tip: form.tip,
      solution: form.solution,
      eval_points: form.eval_points,
      total_points: form.total_points,
      relatedCollectionId: form.relatedCollectionId,
      tags,
    };

    this.removeUndefinedFields(contentData);

    const operation = editing && editing.id
      ? this.contentService.updateContent(editing.id, contentData)
      : this.contentService.createContent(contentData);

    operation.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Content ${editing ? 'updated' : 'created'} successfully`,
        });
        this.closeContentDialog();
        this.loadCollections();
        this.reloadCurrentView();
      },
      error: (err) => {
        console.error('Failed to save content:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || 'Failed to save content',
        });
      },
    });
  }

  deleteContent(content: Exercise): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this content? This action cannot be undone.',
      header: 'Delete Content',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.contentService.deleteContent(content.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Content deleted successfully',
            });
            const collection = this.selectedCollection();
            if (collection) {
              this.selectCollection(collection);
            } else if (this.showingUngrouped()) {
              this.loadUngroupedContent();
            }
          },
          error: (err) => {
            console.error('Failed to delete content:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete content',
            });
          },
        });
      },
    });
  }

  // ========== Form Update Methods ==========

  updateCollectionForm<K extends keyof LearningContentCollection>(field: K, value: LearningContentCollection[K]): void {
    this.collectionForm.update(form => ({ ...form, [field]: value }));
  }

  updateContentForm<K extends keyof Exercise>(field: K, value: Exercise[K]): void {
    this.contentForm.update(form => ({ ...form, [field]: value }));
  }

  // ========== Utility Methods ==========

  asExercise(content: LearningContent): Exercise {
    return content as Exercise;
  }

  getStatusLabel(status: Status): string {
    const labels: Record<Status, string> = {
      [Status.DRAFT]: 'Draft',
      [Status.PUBLISHED]: 'Published',
      [Status.ARCHIVED]: 'Archived',
    };
    return labels[status] ?? 'Unknown';
  }

  getContrastColor(bgColor: string): string {
    if (!bgColor || bgColor === 'transparent') return 'var(--p-text-color)';
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155 ? 'var(--p-text-color)' : 'var(--p-surface-0)';
  }

  openAddToCollectionDialog(content: Exercise): void {
    this.selectedContentForCollection.set(content);
    this.selectedCollectionIds.set([]);

    // Filter out collections that already contain this content
    const availableCollections = this.collections().filter(collection => {
      if (!collection.contents?.length) return true;
      return !collection.contents.some(c => {
        const contentId = typeof c === 'string' ? c : (c as LearningContent).id;
        return contentId === content.id;
      });
    });
    this.availableCollectionsForContent.set(availableCollections);

    this.addToCollectionDialogVisible.set(true);
  }

  closeAddToCollectionDialog(): void {
    this.addToCollectionDialogVisible.set(false);
    this.selectedContentForCollection.set(null);
    this.selectedCollectionIds.set([]);
  }

  addToCollection(): void {
    const content = this.selectedContentForCollection();
    const collectionIds = this.selectedCollectionIds();

    if (!content?.id || !collectionIds || collectionIds.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please select at least one collection',
      });
      return;
    }

    const addRequests = collectionIds.map(collectionId =>
      this.contentService.addToCollection(content.id!, collectionId)
    );

    forkJoin(addRequests).subscribe({
      next: () => {
        const collectionText = collectionIds.length === 1 ? 'collection' : `${collectionIds.length} collections`;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Content added to ${collectionText} successfully`,
        });
        this.loadUngroupedContent();
        this.loadCollections();
        const selectedCollection = this.selectedCollection();
        if (selectedCollection) {
          this.selectCollection(selectedCollection);
        }
        this.closeAddToCollectionDialog();
      },
      error: (err) => {
        console.error('Failed to add content to collections:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to add content to collections',
        });
      },
    });
  }

  removeFromCollection(content: Exercise): void {
    const contentId = content.id;
    const collection = this.selectedCollection();
    if (!contentId || !collection) return;

    this.confirmationService.confirm({
      message: 'Are you sure you want to remove this content from the collection?',
      header: 'Remove from Collection',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.contentService.removeFromCollection(contentId, collection.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Content removed from collection',
            });
            this.selectCollection(collection);
            this.loadCollections();
          },
          error: (err) => {
            console.error('Failed to remove content from collection:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to remove content from collection',
            });
          },
        });
      },
    });
  }

  private loadCollections(): void {
    const search = this.collectionSearchQuery();
    const status = this.collectionStatusFilter();
    const filters: CollectionFilters = {
      ...(search && { search }),
      ...(status && { status }),
    };

    this.collectionsService.getCollections(filters).subscribe({
      next: (response) => {
        this.collections.set(response.data);
      },
      error: (err) => {
        console.error('Failed to load collections:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load collections',
        });
      },
    });
  }

  private loadAvailableTags(): void {
    this.tagsService.getTagGroups().subscribe({
      next: (response) => {
        const allTags = response.data.flatMap(group => group.tags || []);
        this.availableTags.set(allTags);
      },
      error: (err) => {
        console.error('Failed to load tags:', err);
      },
    });
  }

  private loadUngroupedContent(): void {
    this.contentService.getUngroupedContent().subscribe({
      next: (response) => {
        this.ungroupedContent.set(response.data);
      },
      error: (err) => {
        console.error('Failed to load ungrouped content:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load ungrouped content',
        });
      },
    });
  }

  private reloadCurrentView(): void {
    if (this.showingUngrouped()) {
      this.loadUngroupedContent();
    } else {
      const collection = this.selectedCollection();
      if (collection) {
        this.selectCollection(collection);
      }
    }
  }

  private removeUndefinedFields(obj: Record<string, unknown>): void {
    for (const key of Object.keys(obj)) {
      if (obj[key] === undefined) {
        delete obj[key];
      }
    }
  }
}
