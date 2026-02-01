import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { UsersComponent } from './users.component';
import { UsersService } from './users.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ConfirmationService, MessageService, Confirmation } from 'primeng/api';
import { User } from '@learnhub/models';

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;
  let usersService: UsersService;
  let messageService: MessageService;
  let confirmationService: ConfirmationService;

  const mockUsers: User[] = [
    { id: '1', username: 'user1', email: 'user1@example.com', displayName: 'User One', status: 'active' },
    { id: '2', username: 'user2', email: 'user2@example.com', displayName: 'User Two', status: 'locked' },
  ];

  const mockUsersResponse = { data: mockUsers, total: 2, page: 1, limit: 20, totalPages: 1 };

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
      .overrideComponent(UsersComponent, { set: { providers: [] } })
      .compileComponents();

    usersService = TestBed.inject(UsersService);
    messageService = TestBed.inject(MessageService);
    confirmationService = TestBed.inject(ConfirmationService);
  });

  function setupMocks(): void {
    jest.spyOn(usersService, 'getUsers').mockReturnValue(of(mockUsersResponse));
  }

  function createComponent(): void {
    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create and load users on initialization', () => {
    setupMocks();
    createComponent();

    expect(component).toBeTruthy();
    expect(component.users()).toEqual(mockUsers);
    expect(component.totalRecords()).toBe(2);
  });

  it('should handle error when loading users fails', () => {
    jest.spyOn(usersService, 'getUsers').mockReturnValue(throwError(() => new Error('API Error')));
    const addSpy = jest.spyOn(messageService, 'add');
    createComponent();

    expect(addSpy).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load users',
    });
  });

  it('should search users and reset to page 1', () => {
    setupMocks();
    createComponent();

    component.searchQuery.set('test');
    component.onSearch();

    expect(component.currentPage()).toBe(1);
    expect(usersService.getUsers).toHaveBeenCalledWith(expect.objectContaining({ search: 'test' }));
  });

  it('should handle page change', () => {
    setupMocks();
    createComponent();

    component.onPageChange({ first: 50, rows: 50 });

    expect(component.currentPage()).toBe(2);
    expect(component.rowsPerPage()).toBe(50);
  });

  it('should view user details', () => {
    setupMocks();
    jest.spyOn(usersService, 'getUser').mockReturnValue(of(mockUsers[0]));
    createComponent();

    component.viewUser(mockUsers[0]);

    expect(component.selectedUser()).toEqual(mockUsers[0]);
    expect(component.drawerVisible()).toBe(true);
  });

  it('should delete user with confirmation', () => {
    setupMocks();
    jest.spyOn(usersService, 'deleteUser').mockReturnValue(of({ success: true, message: 'User deleted', id: '1' }));
    const addSpy = jest.spyOn(messageService, 'add');
    jest.spyOn(confirmationService, 'confirm').mockImplementation((confirmation: Confirmation) => {
      confirmation.accept?.();
      return confirmationService;
    });
    createComponent();

    component.deleteUser(mockUsers[0]);

    expect(addSpy).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Success',
      detail: 'User deleted successfully',
    });
  });

  it('should return correct status severity and label', () => {
    setupMocks();
    createComponent();

    expect(component.getStatusSeverity('active')).toBe('success');
    expect(component.getStatusSeverity('locked')).toBe('danger');
    expect(component.getStatusLabel('active')).toBe('Active');
    expect(component.getStatusLabel('locked')).toBe('Locked');
  });
});
