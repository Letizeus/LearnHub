import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LearningContentCollection, Status } from '@learnhub/models';
import { CoursesService, CourseFilters } from './courses.service';
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
  selector: 'app-courses',
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
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoursesComponent {
  private readonly coursesService = inject(CoursesService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  // State signals
  readonly courses = signal<LearningContentCollection[]>([]);
  readonly selectedCourse = signal<LearningContentCollection | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly drawerVisible = signal<boolean>(false);
  readonly totalRecords = signal<number>(0);

  // Filter signals
  readonly searchQuery = signal<string>('');
  readonly statusFilter = signal<string>('');
  readonly currentPage = signal<number>(1);
  readonly rowsPerPage = signal<number>(20);

  // Filter options
  readonly statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Draft', value: Status.DRAFT },
    { label: 'Published', value: Status.PUBLISHED },
    { label: 'Archived', value: Status.ARCHIVED },
  ];

  constructor() {
    this.loadCourses();
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadCourses();
  }

  onPageChange(event: TablePageEvent): void {
    this.currentPage.set((event.first || 0) / (event.rows || 20) + 1);
    this.rowsPerPage.set(event.rows || 20);
    this.loadCourses();
  }

  onSort(event: { field?: string; order?: number }): void {
    this.loadCourses({
      sortBy: event.field,
      sortOrder: event.order === 1 ? 'asc' : 'desc',
    });
  }

  viewCourse(course: LearningContentCollection): void {
    this.coursesService.getCourse(course.id).subscribe({
      next: (detailedCourse) => {
        this.selectedCourse.set(detailedCourse);
        this.drawerVisible.set(true);
      },
      error: (err) => {
        console.error('Failed to load course details:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load course details',
        });
      },
    });
  }

  closeDrawer(): void {
    this.drawerVisible.set(false);
    this.selectedCourse.set(null);
  }

  deleteCourse(course: LearningContentCollection): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete course "${course.title}"? This action cannot be undone.`,
      header: 'Delete Course',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.coursesService.deleteCourse(course.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Course deleted successfully',
            });
            this.loadCourses();
            if (this.selectedCourse()?.id === course.id) {
              this.closeDrawer();
            }
          },
          error: (err) => {
            console.error('Failed to delete course:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete course',
            });
          },
        });
      },
    });
  }

  getStatusClass(status: string | Status): string {
    const classMap: Record<string, string> = {
      [Status.DRAFT]: 'status-draft',
      [Status.PUBLISHED]: 'status-published',
      [Status.ARCHIVED]: 'status-archived',
    };
    return classMap[status] ?? 'status-draft';
  }

  getStatusLabel(status: string | Status): string {
    const labelMap: Record<string, string> = {
      [Status.DRAFT]: 'Draft',
      [Status.PUBLISHED]: 'Published',
      [Status.ARCHIVED]: 'Archived',
    };
    return labelMap[status] ?? status;
  }

  private loadCourses(
    sortOverrides?: { sortBy?: string; sortOrder?: 'asc' | 'desc' }
  ): void {
    this.isLoading.set(true);

    const filters: CourseFilters = {
      search: this.searchQuery() || undefined,
      status: this.statusFilter() || undefined,
      page: this.currentPage(),
      limit: this.rowsPerPage(),
      ...sortOverrides,
    };

    this.coursesService.getCourses(filters).subscribe({
      next: (response) => {
        this.courses.set(response.data);
        this.totalRecords.set(response.total);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load courses:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load courses',
        });
        this.isLoading.set(false);
      },
    });
  }
}
