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
      tags: [{ name: 'beginner', icon: 'pi pi-star', color: '#4CAF50', backgroundImage: '' }],
      relatedCollectionId: 'course1',
      text: 'What is 2 + 2?',
      tip: 'Add the numbers',
      solution: '4',
      eval_points: 10,
      total_points: 10,
      createdAt: new Date('2024-01-15'),
      changedAt: new Date('2024-01-15'),
    },
  ];

  const mockResponse = { data: mockContentItems, total: 1, page: 1, limit: 20, totalPages: 1 };

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

  it('should create and load content on initialization', () => {
    jest.spyOn(contentService, 'getContent').mockReturnValue(of(mockResponse));
    createComponent();

    expect(component).toBeTruthy();
    expect(component.contentItems()).toEqual(mockContentItems);
    expect(component.totalRecords()).toBe(1);
  });

  it('should reset to page 1 on filter change', () => {
    jest.spyOn(contentService, 'getContent').mockReturnValue(of(mockResponse));
    createComponent();
    component.currentPage.set(2);

    component.onFilterChange();

    expect(component.currentPage()).toBe(1);
  });

  it('should view content details', () => {
    jest.spyOn(contentService, 'getContent').mockReturnValue(of(mockResponse));
    jest.spyOn(contentService, 'getContentItem').mockReturnValue(of(mockContentItems[0]));
    createComponent();

    component.viewContent(mockContentItems[0]);

    expect(component.selectedContent()).toEqual(mockContentItems[0]);
    expect(component.drawerVisible()).toBe(true);
  });

  it('should calculate contrast color correctly', () => {
    jest.spyOn(contentService, 'getContent').mockReturnValue(of(mockResponse));
    createComponent();

    expect(component.getContrastColor('#FFFFFF')).toBe('var(--p-text-color)');
    expect(component.getContrastColor('#000000')).toBe('var(--p-surface-0)');
  });
});
