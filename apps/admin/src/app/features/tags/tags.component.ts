import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tag, TagGroup, TagVisibility } from '@learnhub/models';
import { TagsService } from './tags.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-tags',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule,
    SelectModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './tags.component.html',
  styleUrl: './tags.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagsComponent {
  private readonly tagsService = inject(TagsService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  // State signals
  readonly tagGroups = signal<TagGroup[]>([]);
  readonly selectedTagGroup = signal<TagGroup | null>(null);
  readonly dialogVisible = signal<boolean>(false);
  readonly tagDialogVisible = signal<boolean>(false);

  // Form state
  readonly searchQuery = signal<string>('');
  readonly editMode = signal<boolean>(false);
  readonly editingTag = signal<Tag | null>(null);
  readonly tagGroupForm = signal<Partial<TagGroup>>({});
  readonly tagForm = signal<Partial<Tag>>({});

  // Visibility options
  readonly visibilityOptions = [
    { label: 'Search Page', value: TagVisibility.SEARCH_PAGE },
    { label: 'Tag Select', value: TagVisibility.TAG_SELECT },
  ];

  constructor() {
    this.loadTagGroups();
  }

  onSearch(): void {
    this.loadTagGroups();
  }

  selectTagGroup(tagGroup: TagGroup): void {
    this.tagsService.getTagGroup(tagGroup.id).subscribe({
      next: (detailedTagGroup) => {
        this.selectedTagGroup.set(detailedTagGroup);
      },
      error: (err) => {
        console.error('Failed to load tag group details:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load tag group details',
        });
      },
    });
  }

  openCreateTagGroupDialog(): void {
    this.editMode.set(false);
    this.tagGroupForm.set({ name: '', icon: '', visibility: TagVisibility.SEARCH_PAGE });
    this.dialogVisible.set(true);
  }

  openEditTagGroupDialog(tagGroup: TagGroup): void {
    this.editMode.set(true);
    this.tagGroupForm.set({ ...tagGroup });
    this.dialogVisible.set(true);
  }

  closeDialog(): void {
    this.dialogVisible.set(false);
    this.tagGroupForm.set({});
  }

  saveTagGroup(): void {
    const form = this.tagGroupForm();
    if (!form.name || !form.icon) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Name and icon are required',
      });
      return;
    }

    if (this.editMode() && !form.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Tag group ID is missing',
      });
      return;
    }

    const operation = this.editMode() && form.id
      ? this.tagsService.updateTagGroup(form.id, form)
      : this.tagsService.createTagGroup(form);

    operation.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Tag group ${this.editMode() ? 'updated' : 'created'} successfully`,
        });
        this.closeDialog();
        this.loadTagGroups();
      },
      error: (err) => {
        console.error('Failed to save tag group:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save tag group',
        });
      },
    });
  }

  deleteTagGroup(tagGroup: TagGroup): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete tag group "${tagGroup.name}"? This will also delete all associated tags.`,
      header: 'Delete Tag Group',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.tagsService.deleteTagGroup(tagGroup.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Tag group deleted successfully',
            });
            if (this.selectedTagGroup()?.id === tagGroup.id) {
              this.selectedTagGroup.set(null);
            }
            this.loadTagGroups();
          },
          error: (err) => {
            console.error('Failed to delete tag group:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete tag group',
            });
          },
        });
      },
    });
  }

  openAddTagDialog(): void {
    this.editingTag.set(null);
    this.tagForm.set({ name: '' });
    this.tagDialogVisible.set(true);
  }

  openEditTagDialog(tag: Tag): void {
    this.editingTag.set(tag);
    this.tagForm.set({ ...tag });
    this.tagDialogVisible.set(true);
  }

  closeTagDialog(): void {
    this.tagDialogVisible.set(false);
    this.tagForm.set({});
    this.editingTag.set(null);
  }

  saveTag(): void {
    const form = this.tagForm();
    const tagGroup = this.selectedTagGroup();
    const editingTag = this.editingTag();

    if (!form.name || !tagGroup) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Tag name is required',
      });
      return;
    }

    if (editingTag && !editingTag.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Tag ID is missing',
      });
      return;
    }

    const operation = editingTag && editingTag.id
      ? this.tagsService.updateTag(tagGroup.id, editingTag.id, form)
      : this.tagsService.addTag(tagGroup.id, form);

    operation.subscribe({
      next: (updatedTagGroup) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Tag ${this.editingTag() ? 'updated' : 'added'} successfully`,
        });
        this.selectedTagGroup.set(updatedTagGroup);
        this.loadTagGroups();
        this.closeTagDialog();
      },
      error: (err) => {
        console.error('Failed to save tag:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save tag',
        });
      },
    });
  }

  deleteTag(tag: Tag): void {
    const tagGroup = this.selectedTagGroup();
    const tagId = tag.id;
    if (!tagGroup || !tagId) return;

    this.confirmationService.confirm({
      message: `Are you sure you want to delete tag "${tag.name}"?`,
      header: 'Delete Tag',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.tagsService.deleteTag(tagGroup.id, tagId).subscribe({
          next: (updatedTagGroup) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Tag deleted successfully',
            });
            this.selectedTagGroup.set(updatedTagGroup);
            this.loadTagGroups();
          },
          error: (err) => {
            console.error('Failed to delete tag:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete tag',
            });
          },
        });
      },
    });
  }

  getVisibilityLabel(visibility: TagVisibility): string {
    return visibility === TagVisibility.SEARCH_PAGE ? 'Search Page' : 'Tag Select';
  }

  private loadTagGroups(): void {
    const search = this.searchQuery();
    const params = search ? { search } : {};

    this.tagsService.getTagGroups(params).subscribe({
      next: (response) => {
        this.tagGroups.set(response.data);
      },
      error: (err) => {
        console.error('Failed to load tag groups:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load tag groups',
        });
      },
    });
  }
}
