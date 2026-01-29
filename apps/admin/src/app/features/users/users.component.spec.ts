import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError, Observable } from 'rxjs';
import { UsersComponent } from './users.component';
import { UsersService } from './users.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ConfirmationService, MessageService, Confirmation } from 'primeng/api';
import { AdminUser } from '@learnhub/models';

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;
  let usersService: UsersService;
  let messageService: MessageService;
  let confirmationService: ConfirmationService;

  const mockUsers: AdminUser[] = [
    {
      id: '1',
      username: 'user1',
      email: 'user1@example.com',
      displayName: 'User One',
      status: 'active',
      lastActiveAt: '2026-01-20T10:00:00Z',
    },
    {
      id: '2',
      username: 'user2',
      email: 'user2@example.com',
      displayName: 'User Two',
      status: 'locked',
      lastActiveAt: '2026-01-15T10:00:00Z',
    },
  ];

  const mockUsersResponse = {
    data: mockUsers,
    total: 2,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersComponent],
      providers: [
        UsersService,
        MessageService,
        ConfirmationService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    })
      .overrideComponent(UsersComponent, {
        set: {
          providers: [],
        },
      })
      .compileComponents();

    usersService = TestBed.inject(UsersService);
    messageService = TestBed.inject(MessageService);
    confirmationService = TestBed.inject(ConfirmationService);
  });

  afterEach(() => {
    if (fixture) {
      fixture.destroy();
    }
  });

  it('should create', () => {
    jest.spyOn(usersService, 'getUsers').mockReturnValue(of(mockUsersResponse));
    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;

    expect(component).toBeTruthy();
  });

  it('should load users on initialization', () => {
    jest.spyOn(usersService, 'getUsers').mockReturnValue(of(mockUsersResponse));
    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.isLoading()).toBe(false);
    expect(component.users()).toEqual(mockUsers);
    expect(component.totalRecords()).toBe(2);
  });

  it('should display loading state initially', () => {
    jest.spyOn(usersService, 'getUsers').mockReturnValue(
      new Observable(() => {
        // Never complete to keep loading state
      })
    );
    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.isLoading()).toBe(true);
  });

  it('should handle error when loading users fails', () => {
    jest
      .spyOn(usersService, 'getUsers')
      .mockReturnValue(throwError(() => new Error('API Error')));
    const addSpy = jest.spyOn(messageService, 'add');
    
    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.isLoading()).toBe(false);
    expect(addSpy).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load users',
    });
  });

  it('should search users and reset to page 1', () => {
    jest
      .spyOn(usersService, 'getUsers')
      .mockReturnValue(of(mockUsersResponse));
    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.searchQuery.set('test');
    component.onSearch();

    expect(component.currentPage()).toBe(1);
    expect(usersService.getUsers).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'test' })
    );
  });

  it('should filter by status and reset to page 1', () => {
    jest
      .spyOn(usersService, 'getUsers')
      .mockReturnValue(of(mockUsersResponse));
    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.statusFilter.set('locked');
    component.onStatusChange();

    expect(component.currentPage()).toBe(1);
    expect(usersService.getUsers).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'locked' })
    );
  });

  it('should handle page change', () => {
    jest
      .spyOn(usersService, 'getUsers')
      .mockReturnValue(of(mockUsersResponse));
    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.onPageChange({ first: 50, rows: 50 });

    expect(component.currentPage()).toBe(2);
    expect(component.rowsPerPage()).toBe(50);
  });

  it('should view user details', () => {
    const detailedUser = { ...mockUsers[0], createdAt: '2026-01-01T00:00:00Z' };
    jest.spyOn(usersService, 'getUsers').mockReturnValue(of(mockUsersResponse));
    jest.spyOn(usersService, 'getUser').mockReturnValue(of(detailedUser));
    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.viewUser(mockUsers[0]);

    expect(component.selectedUser()).toEqual(detailedUser);
    expect(component.drawerVisible()).toBe(true);
  });

  it('should close drawer', () => {
    jest.spyOn(usersService, 'getUsers').mockReturnValue(of(mockUsersResponse));
    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.selectedUser.set(mockUsers[0]);
    component.drawerVisible.set(true);

    component.closeDrawer();

    expect(component.selectedUser()).toBeNull();
    expect(component.drawerVisible()).toBe(false);
  });

  it('should lock user with confirmation', () => {
    jest.spyOn(usersService, 'getUsers').mockReturnValue(of(mockUsersResponse));
    const lockSpy = jest
      .spyOn(usersService, 'lockUser')
      .mockReturnValue(of({ id: '1', status: 'locked' } as AdminUser));
    const addSpy = jest.spyOn(messageService, 'add');
    jest.spyOn(confirmationService, 'confirm').mockImplementation((confirmation: Confirmation) => {
      confirmation.accept?.();
      return confirmationService;
    });

    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.lockUser(mockUsers[0]);

    expect(lockSpy).toHaveBeenCalledWith('1');
    expect(addSpy).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Success',
      detail: 'User locked successfully',
    });
  });

  it('should unlock user with confirmation', () => {
    jest.spyOn(usersService, 'getUsers').mockReturnValue(of(mockUsersResponse));
    const unlockSpy = jest
      .spyOn(usersService, 'unlockUser')
      .mockReturnValue(of({ id: '2', status: 'active' } as AdminUser));
    const addSpy = jest.spyOn(messageService, 'add');
    jest.spyOn(confirmationService, 'confirm').mockImplementation((confirmation: Confirmation) => {
      confirmation.accept?.();
      return confirmationService;
    });

    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.unlockUser(mockUsers[1]);

    expect(unlockSpy).toHaveBeenCalledWith('2');
    expect(addSpy).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Success',
      detail: 'User unlocked successfully',
    });
  });

  it('should delete user with confirmation', () => {
    jest.spyOn(usersService, 'getUsers').mockReturnValue(of(mockUsersResponse));
    const deleteSpy = jest
      .spyOn(usersService, 'deleteUser')
      .mockReturnValue(
        of({ success: true, message: 'User deleted successfully', id: '1' })
      );
    const addSpy = jest.spyOn(messageService, 'add');
    jest.spyOn(confirmationService, 'confirm').mockImplementation((confirmation: Confirmation) => {
      confirmation.accept?.();
      return confirmationService;
    });

    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.deleteUser(mockUsers[0]);

    expect(deleteSpy).toHaveBeenCalledWith('1');
    expect(addSpy).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Success',
      detail: 'User deleted successfully',
    });
  });

  it('should return correct status class and label', () => {
    jest.spyOn(usersService, 'getUsers').mockReturnValue(of(mockUsersResponse));
    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;

    expect(component.getStatusClass('active')).toBe('status-active');
    expect(component.getStatusClass('locked')).toBe('status-locked');
    expect(component.getStatusLabel('active')).toBe('Active');
    expect(component.getStatusLabel('locked')).toBe('Locked');
  });
});
