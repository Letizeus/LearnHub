import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CoursesComponent } from './courses.component';
import { CoursesService } from './courses.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { LearningContentCollection, Status } from '@learnhub/models';

describe('CoursesComponent', () => {
  let component: CoursesComponent;
  let fixture: ComponentFixture<CoursesComponent>;
  let coursesService: CoursesService;

  const mockCourses: LearningContentCollection[] = [
    {
      id: '1',
      title: 'Test Course 1',
      status: Status.PUBLISHED,
      author: 'John Doe',
      contents: [],
      contentIds: ['content1', 'content2'],
      source: {
        url: 'https://example.com/course1',
        publisher: 'Test Publisher',
        organisation: 'Test Org',
        publishedAt: new Date('2024-01-10'),
      },
      createdAt: new Date('2024-01-10T10:00:00Z'),
      changedAt: new Date('2024-01-15T10:00:00Z'),
    },
    {
      id: '2',
      title: 'Test Course 2',
      status: Status.ARCHIVED,
      author: 'Jane Smith',
      contents: [],
      contentIds: ['content3'],
      createdAt: new Date('2024-01-09T10:00:00Z'),
      changedAt: new Date('2024-01-14T10:00:00Z'),
    },
  ];

  const mockResponse = {
    data: mockCourses,
    total: 2,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoursesComponent],
      providers: [
        CoursesService,
        ConfirmationService,
        MessageService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    coursesService = TestBed.inject(CoursesService);
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(CoursesComponent);
    component = fixture.componentInstance;
  }

  it('should create', () => {
    jest.spyOn(coursesService, 'getCourses').mockReturnValue(of(mockResponse));
    createComponent();
    expect(component).toBeTruthy();
  });

  it('should load courses on initialization', () => {
    const spy = jest.spyOn(coursesService, 'getCourses').mockReturnValue(of(mockResponse));
    createComponent();

    expect(spy).toHaveBeenCalled();
    expect(component.courses()).toEqual(mockCourses);
    expect(component.totalRecords()).toBe(2);
    expect(component.isLoading()).toBe(false);
  });

  it('should reset to page 1 on filter change', () => {
    jest.spyOn(coursesService, 'getCourses').mockReturnValue(of(mockResponse));
    createComponent();
    component.currentPage.set(2);

    component.onFilterChange();

    expect(component.currentPage()).toBe(1);
  });

  it('should handle page change', () => {
    jest.spyOn(coursesService, 'getCourses').mockReturnValue(of(mockResponse));
    createComponent();

    component.onPageChange({ first: 20, rows: 20 });

    expect(component.currentPage()).toBe(2);
    expect(component.rowsPerPage()).toBe(20);
  });

  it('should view course details', () => {
    jest.spyOn(coursesService, 'getCourses').mockReturnValue(of(mockResponse));
    const detailSpy = jest.spyOn(coursesService, 'getCourse').mockReturnValue(of(mockCourses[0]));
    createComponent();

    component.viewCourse(mockCourses[0]);

    expect(detailSpy).toHaveBeenCalledWith('1');
    expect(component.selectedCourse()).toEqual(mockCourses[0]);
    expect(component.drawerVisible()).toBe(true);
  });

  it('should close drawer', () => {
    jest.spyOn(coursesService, 'getCourses').mockReturnValue(of(mockResponse));
    createComponent();
    component.drawerVisible.set(true);
    component.selectedCourse.set(mockCourses[0]);

    component.closeDrawer();

    expect(component.drawerVisible()).toBe(false);
    expect(component.selectedCourse()).toBeNull();
  });

  it('should return correct status class', () => {
    jest.spyOn(coursesService, 'getCourses').mockReturnValue(of(mockResponse));
    createComponent();

    expect(component.getStatusClass(Status.DRAFT)).toBe('status-draft');
    expect(component.getStatusClass(Status.PUBLISHED)).toBe('status-published');
    expect(component.getStatusClass(Status.ARCHIVED)).toBe('status-archived');
  });

  it('should return correct status label', () => {
    jest.spyOn(coursesService, 'getCourses').mockReturnValue(of(mockResponse));
    createComponent();

    expect(component.getStatusLabel(Status.DRAFT)).toBe('Draft');
    expect(component.getStatusLabel(Status.PUBLISHED)).toBe('Published');
    expect(component.getStatusLabel(Status.ARCHIVED)).toBe('Archived');
  });
});
