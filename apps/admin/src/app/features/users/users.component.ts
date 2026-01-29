import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminUser } from '@learnhub/models';
import { UsersService, UserFilters } from './users.service';
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
  selector: 'app-users',
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
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent {
  private readonly usersService = inject(UsersService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  // State signals
  readonly users = signal<AdminUser[]>([]);
  readonly selectedUser = signal<AdminUser | null>(null);
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
    { label: 'Active', value: 'active' },
    { label: 'Locked', value: 'locked' },
  ];

  constructor() {
    this.loadUsers();
  }

  onSearch(): void {
    this.resetAndLoadUsers();
  }

  onStatusChange(): void {
    this.resetAndLoadUsers();
  }

  private resetAndLoadUsers(): void {
    this.currentPage.set(1);
    this.loadUsers();
  }

  onPageChange(event: TablePageEvent): void {
    this.currentPage.set((event.first || 0) / (event.rows || 20) + 1);
    this.rowsPerPage.set(event.rows || 20);
    this.loadUsers();
  }

  onSort(event: { field?: string; order?: number }): void {
    this.loadUsers({
      sortBy: event.field,
      sortOrder: event.order === 1 ? 'asc' : 'desc',
    });
  }

  viewUser(user: AdminUser): void {
    this.usersService.getUser(user.id).subscribe({
      next: (detailedUser) => {
        this.selectedUser.set(detailedUser);
        this.drawerVisible.set(true);
      },
      error: (err) => {
        console.error('Failed to load user details:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load user details',
        });
      },
    });
  }

  closeDrawer(): void {
    this.drawerVisible.set(false);
    this.selectedUser.set(null);
  }

  lockUser(user: AdminUser): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to lock user "${user.displayName}"? They will not be able to access the platform.`,
      header: 'Lock User',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.usersService.lockUser(user.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'User locked successfully',
            });
            this.loadUsers();
            if (this.selectedUser()?.id === user.id) {
              this.closeDrawer();
            }
          },
          error: (err) => {
            console.error('Failed to lock user:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to lock user',
            });
          },
        });
      },
    });
  }

  unlockUser(user: AdminUser): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to unlock user "${user.displayName}"? They will regain access to the platform.`,
      header: 'Unlock User',
      icon: 'pi pi-question-circle',
      accept: () => {
        this.usersService.unlockUser(user.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'User unlocked successfully',
            });
            this.loadUsers();
            if (this.selectedUser()?.id === user.id) {
              this.closeDrawer();
            }
          },
          error: (err) => {
            console.error('Failed to unlock user:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to unlock user',
            });
          },
        });
      },
    });
  }

  deleteUser(user: AdminUser): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete user "${user.displayName}"? This action cannot be undone.`,
      header: 'Delete User',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.usersService.deleteUser(user.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'User deleted successfully',
            });
            this.loadUsers();
            if (this.selectedUser()?.id === user.id) {
              this.closeDrawer();
            }
          },
          error: (err) => {
            console.error('Failed to delete user:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete user',
            });
          },
        });
      },
    });
  }

  getStatusClass(status: string): string {
    return status === 'active' ? 'status-active' : 'status-locked';
  }

  getStatusLabel(status: string): string {
    return status === 'active' ? 'Active' : 'Locked';
  }

  private loadUsers(sortOverrides?: { sortBy?: string; sortOrder?: 'asc' | 'desc' }): void {
    this.isLoading.set(true);

    const filters: UserFilters = {
      search: this.searchQuery() || undefined,
      status: this.statusFilter() || undefined,
      page: this.currentPage(),
      limit: this.rowsPerPage(),
      ...sortOverrides,
    };

    this.usersService.getUsers(filters).subscribe({
      next: (response) => {
        this.users.set(response.data);
        this.totalRecords.set(response.total);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load users:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load users',
        });
        this.isLoading.set(false);
      },
    });
  }
}
