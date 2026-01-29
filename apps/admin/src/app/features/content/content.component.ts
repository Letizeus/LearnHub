import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Exercise, Tag } from '@learnhub/models';
import { ContentService, ContentFilters } from './content.service';
import { TableModule, TablePageEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DrawerModule } from 'primeng/drawer';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DrawerModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentComponent {
  private readonly contentService = inject(ContentService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  // State signals
  readonly contentItems = signal<Exercise[]>([]);
  readonly selectedContent = signal<Exercise | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly drawerVisible = signal<boolean>(false);
  readonly totalRecords = signal<number>(0);

  // Filter signals
  readonly searchQuery = signal<string>('');
  readonly typeFilter = signal<string>('');
  readonly currentPage = signal<number>(1);
  readonly rowsPerPage = signal<number>(20);

  // Filter options
  readonly typeOptions = [
    { label: 'All Types', value: '' },
    { label: 'Exercise', value: 'EXERCISE' },
  ];

  constructor() {
    this.loadContent();
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadContent();
  }

  onPageChange(event: TablePageEvent): void {
    this.currentPage.set((event.first || 0) / (event.rows || 20) + 1);
    this.rowsPerPage.set(event.rows || 20);
    this.loadContent();
  }

  onSort(event: { field?: string; order?: number }): void {
    this.loadContent({
      sortBy: event.field,
      sortOrder: event.order === 1 ? 'asc' : 'desc',
    });
  }

  viewContent(content: Exercise): void {
    this.contentService.getContentItem(content.id).subscribe({
      next: (detailedContent) => {
        this.selectedContent.set(detailedContent);
        this.drawerVisible.set(true);
      },
      error: (err) => {
        console.error('Failed to load content details:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load content details',
        });
      },
    });
  }

  closeDrawer(): void {
    this.drawerVisible.set(false);
    this.selectedContent.set(null);
  }

  deleteContent(content: Exercise): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete this content item? This action cannot be undone.`,
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
            this.loadContent();
            if (this.selectedContent()?.id === content.id) {
              this.closeDrawer();
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

  getContrastColor(bgColor: string): string {
    const color = bgColor.replace('#', '');
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155 ? '#000000' : '#FFFFFF';
  }

  private loadContent(
    sortOverrides?: { sortBy?: string; sortOrder?: 'asc' | 'desc' }
  ): void {
    this.isLoading.set(true);

    const filters: ContentFilters = {
      search: this.searchQuery() || undefined,
      type: this.typeFilter() || undefined,
      page: this.currentPage(),
      limit: this.rowsPerPage(),
      ...sortOverrides,
    };

    this.contentService.getContent(filters).subscribe({
      next: (response) => {
        this.contentItems.set(response.data);
        this.totalRecords.set(response.total);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load content:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load content',
        });
        this.isLoading.set(false);
      },
    });
  }
}
