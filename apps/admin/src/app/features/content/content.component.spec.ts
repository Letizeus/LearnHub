import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContentComponent } from './content.component';
import { ContentService } from './content.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Exercise } from '@learnhub/models';

describe('ContentComponent', () => {
  let component: ContentComponent;
  let fixture: ComponentFixture<ContentComponent>;
  let contentService: ContentService;

  const mockContentItems: Exercise[] = [
    {
      id: '1',
      type: 'EXERCISE',
      keywords: 'exercise, basics',
      downloads: 42,
      likes: 15,
      tags: [
        { name: 'beginner', icon: 'pi pi-star', color: '#4CAF50', backgroundImage: '' },
        { name: 'tutorial', icon: 'pi pi-book', color: '#2196F3', backgroundImage: '' }
      ],
      relatedCollectionId: 'course1',
      text: 'What is 2 + 2?',
      tip: 'Add the numbers',
      solution: '4',
      eval_points: 10,
      total_points: 10,
      createdAt: new Date('2024-01-15T10:00:00Z'),
      changedAt: new Date('2024-01-15T12:00:00Z'),
    },
    {
      id: '2',
      type: 'EXERCISE',
      keywords: 'exercise, math',
      downloads: 28,
      likes: 8,
      tags: [
        { name: 'advanced', icon: 'pi pi-graduation-cap', color: '#FF5722', backgroundImage: '' },
        { name: 'math', icon: 'pi pi-calculator', color: '#9C27B0', backgroundImage: '' }
      ],
      relatedCollectionId: 'course1',
      text: 'Solve the equation: x + 5 = 10',
      images: ['image1.png'],
      tip: 'Subtract 5 from both sides',
      solution: 'x = 5',
      solutionImages: ['solution1.png'],
      eval_points: 8,
      total_points: 10,
      createdAt: new Date('2024-01-14T10:00:00Z'),
      changedAt: new Date('2024-01-14T11:00:00Z'),
    },
  ];

  const mockResponse = {
    data: mockContentItems,
    total: 2,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentComponent],
      providers: [
        ContentService,
        ConfirmationService,
        MessageService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    contentService = TestBed.inject(ContentService);
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(ContentComponent);
    component = fixture.componentInstance;
  }

  it('should create', () => {
    jest.spyOn(contentService, 'getContent').mockReturnValue(of(mockResponse));
    createComponent();
    expect(component).toBeTruthy();
  });

  it('should load content on initialization', () => {
    const spy = jest.spyOn(contentService, 'getContent').mockReturnValue(of(mockResponse));
    createComponent();

    expect(spy).toHaveBeenCalled();
    expect(component.contentItems()).toEqual(mockContentItems);
    expect(component.totalRecords()).toBe(2);
  });

  it('should reset to page 1 on filter change', () => {
    jest.spyOn(contentService, 'getContent').mockReturnValue(of(mockResponse));
    createComponent();
    component.currentPage.set(2);

    component.onFilterChange();

    expect(component.currentPage()).toBe(1);
  });

  it('should handle page change', () => {
    jest.spyOn(contentService, 'getContent').mockReturnValue(of(mockResponse));
    createComponent();

    component.onPageChange({ first: 20, rows: 20 });

    expect(component.currentPage()).toBe(2);
    expect(component.rowsPerPage()).toBe(20);
  });

  it('should view content details', () => {
    jest.spyOn(contentService, 'getContent').mockReturnValue(of(mockResponse));
    const detailSpy = jest.spyOn(contentService, 'getContentItem').mockReturnValue(of(mockContentItems[0]));
    createComponent();

    component.viewContent(mockContentItems[0]);

    expect(detailSpy).toHaveBeenCalledWith('1');
    expect(component.selectedContent()).toEqual(mockContentItems[0]);
    expect(component.drawerVisible()).toBe(true);
  });

  it('should close drawer', () => {
    jest.spyOn(contentService, 'getContent').mockReturnValue(of(mockResponse));
    createComponent();
    component.drawerVisible.set(true);
    component.selectedContent.set(mockContentItems[0]);

    component.closeDrawer();

    expect(component.drawerVisible()).toBe(false);
    expect(component.selectedContent()).toBeNull();
  });

  it('should calculate contrast color correctly', () => {
    jest.spyOn(contentService, 'getContent').mockReturnValue(of(mockResponse));
    createComponent();

    expect(component.getContrastColor('#FFFFFF')).toBe('#000000');
    expect(component.getContrastColor('#000000')).toBe('#FFFFFF');
    expect(component.getContrastColor('#FF0000')).toBe('#FFFFFF');
  });
});
