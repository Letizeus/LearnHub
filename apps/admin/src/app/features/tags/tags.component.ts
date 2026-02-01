import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';
import { Tag, TagGroup, TagVisibility } from '@learnhub/models';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ColorPickerModule } from 'primeng/colorpicker';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { TagsService } from './tags.service';

@Component({
  selector: 'app-tags',
  standalone: true,
  imports: [
    FormsModule,
    MatIconModule,
    ButtonModule,
    ColorPickerModule,
    ConfirmDialogModule,
    DialogModule,
    InputTextModule,
    MultiSelectModule,
    SelectModule,
    ToastModule,
    TooltipModule,
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

  readonly tagGroups = signal<TagGroup[]>([]);
  readonly selectedTagGroup = signal<TagGroup | null>(null);
  readonly ungroupedTags = signal<Tag[]>([]);
  readonly showingUngrouped = signal(false);
  readonly dialogVisible = signal(false);
  readonly tagDialogVisible = signal(false);
  readonly addToGroupDialogVisible = signal(false);
  readonly searchQuery = signal('');
  readonly editMode = signal(false);
  readonly editingTag = signal<Tag | null>(null);
  readonly tagGroupForm = signal<Partial<TagGroup>>({});
  readonly tagForm = signal<Partial<Tag>>({});
  readonly selectedTagForGrouping = signal<Tag | null>(null);
  readonly selectedGroupIds = signal<string[]>([]);
  readonly availableGroupsForTag = signal<TagGroup[]>([]);

  readonly visibilityOptions = [
    { label: 'Search Page', value: TagVisibility.SEARCH_PAGE },
    { label: 'Tag Select', value: TagVisibility.TAG_SELECT },
  ];

  readonly iconOptions = [
    { label: 'Label', value: 'label', icon: 'label' },
    { label: 'Folder', value: 'folder', icon: 'folder' },
    { label: 'Book', value: 'book', icon: 'book' },
    { label: 'School', value: 'school', icon: 'school' },
    { label: 'Science', value: 'science', icon: 'science' },
    { label: 'Calculate', value: 'calculate', icon: 'calculate' },
    { label: 'Psychology', value: 'psychology', icon: 'psychology' },
    { label: 'Gavel', value: 'gavel', icon: 'gavel' },
    { label: 'History', value: 'history_edu', icon: 'history_edu' },
    { label: 'Account Balance', value: 'account_balance', icon: 'account_balance' },
  ];

  constructor() {
    this.loadTagGroups();
  }

  onSearch(): void {
    this.loadTagGroups();
  }

  selectTagGroup(tagGroup: TagGroup): void {
    this.showingUngrouped.set(false);
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

  selectUngrouped(): void {
    this.showingUngrouped.set(true);
    this.selectedTagGroup.set(null);
    this.loadUngroupedTags();
  }

  openCreateTagGroupDialog(): void {
    this.editMode.set(false);
    this.tagGroupForm.set({ name: '', icon: 'folder', visibility: TagVisibility.SEARCH_PAGE });
    this.dialogVisible.set(true);
  }

  openEditTagGroupDialog(tagGroup: TagGroup): void {
    this.editMode.set(true);
    this.tagGroupForm.set({ ...tagGroup });
    this.dialogVisible.set(true);
  }

  closeDialog(): void {
    this.dialogVisible.set(false);
  }

  onDialogHide(): void {
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
      message: 'Are you sure you want to delete this tag group? This action cannot be undone.',
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
    this.tagForm.set({ name: '', icon: 'tag' });
    this.tagDialogVisible.set(true);
  }

  openAddUngroupedTagDialog(): void {
    this.openAddTagDialog();
  }

  openEditTagDialog(tag: Tag): void {
    this.editingTag.set(tag);
    this.tagForm.set({ ...tag });
    this.tagDialogVisible.set(true);
  }

  closeTagDialog(): void {
    this.tagDialogVisible.set(false);
  }

  onTagDialogHide(): void {
    this.tagForm.set({});
    this.editingTag.set(null);
  }

  saveTag(): void {
    const form = this.tagForm();
    const tagGroup = this.selectedTagGroup();
    const editingTag = this.editingTag();
    const isUngrouped = this.showingUngrouped();

    if (!form.name) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Tag name is required',
      });
      return;
    }

    if (!tagGroup && !isUngrouped) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please select a tag group or ungrouped tags',
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

    if (editingTag && editingTag.id) {
      this.tagsService.updateTag(editingTag.id, form).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Tag updated successfully',
          });
          if (isUngrouped) {
            this.loadUngroupedTags();
          } else if (tagGroup) {
            this.selectTagGroup(tagGroup);
          }
          this.loadTagGroups();
          this.closeTagDialog();
        },
        error: (err) => {
          console.error('Failed to update tag:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update tag',
          });
        },
      });
    } else if (isUngrouped) {
      this.tagsService.createTag(form).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Tag created successfully',
          });
          this.loadUngroupedTags();
          this.closeTagDialog();
        },
        error: (err) => {
          console.error('Failed to create tag:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to create tag',
          });
        },
      });
    } else if (tagGroup) {
      this.tagsService.createTag(form).subscribe({
        next: (createdTag) => {
          this.tagsService.addTagToGroup(tagGroup.id, createdTag.id!).subscribe({
            next: (updatedTagGroup) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Tag created and added to group successfully',
              });
              this.selectedTagGroup.set(updatedTagGroup);
              this.loadTagGroups();
              this.closeTagDialog();
            },
            error: (err) => {
              console.error('Failed to add tag to group:', err);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Tag created but failed to add to group',
              });
            },
          });
        },
        error: (err) => {
          console.error('Failed to create tag:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to create tag',
          });
        },
      });
    }
  }

  removeFromGroup(tag: Tag): void {
    const tagId = tag.id;
    const tagGroup = this.selectedTagGroup();
    if (!tagId || !tagGroup) return;

    this.confirmationService.confirm({
      message: 'Are you sure you want to remove this tag from the group?',
      header: 'Remove from Group',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.tagsService.removeTagFromGroup(tagGroup.id, tagId).subscribe({
          next: (updatedTagGroup: any) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Tag removed from group',
            });
            this.selectedTagGroup.set(updatedTagGroup);
            this.loadTagGroups();
          },
          error: (err: any) => {
            console.error('Failed to remove tag from group:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to remove tag from group',
            });
          },
        });
      },
    });
  }

  openAddToGroupDialog(tag: Tag): void {
    this.selectedTagForGrouping.set(tag);
    this.selectedGroupIds.set([]);

    // Filter out groups that already contain this tag
    const availableGroups = this.tagGroups().filter(group =>
      !group.tags.some(t => t.id === tag.id)
    );
    this.availableGroupsForTag.set(availableGroups);

    this.addToGroupDialogVisible.set(true);
  }

  closeAddToGroupDialog(): void {
    this.addToGroupDialogVisible.set(false);
    this.selectedTagForGrouping.set(null);
    this.selectedGroupIds.set([]);
  }

  addToGroup(): void {
    const tag = this.selectedTagForGrouping();
    const groupIds = this.selectedGroupIds();

    if (!tag?.id || !groupIds || groupIds.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please select at least one tag group',
      });
      return;
    }

    const addRequests = groupIds.map(groupId =>
      this.tagsService.addTagToGroup(groupId, tag.id!)
    );

    forkJoin(addRequests).subscribe({
      next: () => {
        const groupText = groupIds.length === 1 ? 'group' : `${groupIds.length} groups`;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Tag added to ${groupText} successfully`,
        });
        this.loadUngroupedTags();
        this.loadTagGroups();
        const selectedGroup = this.selectedTagGroup();
        if (selectedGroup) {
          this.selectTagGroup(selectedGroup);
        }
        this.closeAddToGroupDialog();
      },
      error: (err) => {
        console.error('Failed to add tag to groups:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to add tag to some groups',
        });
      },
    });
  }

  deleteTag(tag: Tag): void {
    const tagId = tag.id;
    if (!tagId) return;

    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this tag? This action cannot be undone.',
      header: 'Delete Tag',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.tagsService.deleteTag(tagId).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Tag deleted successfully',
            });
            if (this.showingUngrouped()) {
              this.loadUngroupedTags();
            } else {
              const tagGroup = this.selectedTagGroup();
              if (tagGroup) {
                this.selectTagGroup(tagGroup);
              }
              this.loadTagGroups();
            }
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
    return this.visibilityOptions.find((opt) => opt.value === visibility)?.label ?? 'Unknown';
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

  private loadUngroupedTags(): void {
    this.tagsService.getUngroupedTags().subscribe({
      next: (response) => {
        this.ungroupedTags.set(response.data);
      },
      error: (err) => {
        console.error('Failed to load ungrouped tags:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load ungrouped tags',
        });
      },
    });
  }
}
