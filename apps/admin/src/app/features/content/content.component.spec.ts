import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContentComponent } from './content.component';
import { ContentService } from './content.service';
import { CollectionsService } from './collections.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { LearningContentCollection, Exercise, Status } from '@learnhub/models';

describe('ContentComponent', () => {
  let component: ContentComponent;
  let fixture: ComponentFixture<ContentComponent>;
  let collectionsService: CollectionsService;

  const mockCollections: LearningContentCollection[] = [
    {
      id: '1',
      title: 'Math Basics',
      status: Status.PUBLISHED,
      author: 'Test Author',
      contents: [
        {
          id: 'ex1',
          type: 'EXERCISE',
          text: 'What is 2 + 2?',
          tip: 'Add the numbers',
          solution: '4',
          downloads: 10,
          likes: 5,
          tags: [],
        } as Exercise,
      ],
      createdAt: new Date(),
      changedAt: new Date(),
    },
  ];

  const mockCollectionsResponse = { data: mockCollections, total: 1, page: 1, limit: 20, totalPages: 1 };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentComponent],
      providers: [
        ContentService,
        CollectionsService,
        ConfirmationService,
        MessageService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    collectionsService = TestBed.inject(CollectionsService);
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(ContentComponent);
    component = fixture.componentInstance;
  }

  it('should create and load collections on initialization', () => {
    jest.spyOn(collectionsService, 'getCollections').mockReturnValue(of(mockCollectionsResponse));
    createComponent();

    expect(component).toBeTruthy();
    expect(component.collections()).toEqual(mockCollections);
  });

  it('should select a collection and load its contents', () => {
    jest.spyOn(collectionsService, 'getCollections').mockReturnValue(of(mockCollectionsResponse));
    jest.spyOn(collectionsService, 'getCollection').mockReturnValue(of(mockCollections[0]));
    createComponent();

    component.selectCollection(mockCollections[0]);

    expect(component.selectedCollection()).toEqual(mockCollections[0]);
  });

  it('should open create collection dialog', () => {
    jest.spyOn(collectionsService, 'getCollections').mockReturnValue(of(mockCollectionsResponse));
    createComponent();

    component.openCreateCollectionDialog();

    expect(component.collectionDialogVisible()).toBe(true);
    expect(component.collectionEditMode()).toBe(false);
  });

  it('should get status label', () => {
    jest.spyOn(collectionsService, 'getCollections').mockReturnValue(of(mockCollectionsResponse));
    createComponent();

    expect(component.getStatusLabel(Status.DRAFT)).toBe('Draft');
    expect(component.getStatusLabel(Status.PUBLISHED)).toBe('Published');
  });
});
