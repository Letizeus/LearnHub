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
      createdAt: new Date('2024-01-10'),
      changedAt: new Date('2024-01-15'),
    },
  ];

  const mockResponse = { data: mockCourses, total: 1, page: 1, limit: 20, totalPages: 1 };

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

  it('should create and load courses on initialization', () => {
    jest.spyOn(coursesService, 'getCourses').mockReturnValue(of(mockResponse));
    createComponent();

    expect(component).toBeTruthy();
    expect(component.courses()).toEqual(mockCourses);
    expect(component.totalRecords()).toBe(1);
  });

  it('should reset to page 1 on filter change', () => {
    jest.spyOn(coursesService, 'getCourses').mockReturnValue(of(mockResponse));
    createComponent();
    component.currentPage.set(2);

    component.onFilterChange();

    expect(component.currentPage()).toBe(1);
  });

  it('should view course details', () => {
    jest.spyOn(coursesService, 'getCourses').mockReturnValue(of(mockResponse));
    jest.spyOn(coursesService, 'getCourse').mockReturnValue(of(mockCourses[0]));
    createComponent();

    component.viewCourse(mockCourses[0]);

    expect(component.selectedCourse()).toEqual(mockCourses[0]);
    expect(component.drawerVisible()).toBe(true);
  });

  it('should return correct status class and label', () => {
    jest.spyOn(coursesService, 'getCourses').mockReturnValue(of(mockResponse));
    createComponent();

    expect(component.getStatusClass(Status.DRAFT)).toBe('status-draft');
    expect(component.getStatusClass(Status.PUBLISHED)).toBe('status-published');
    expect(component.getStatusLabel(Status.DRAFT)).toBe('Draft');
    expect(component.getStatusLabel(Status.PUBLISHED)).toBe('Published');
  });
});
