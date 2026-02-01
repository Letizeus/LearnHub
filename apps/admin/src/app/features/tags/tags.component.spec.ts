import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TagsComponent } from './tags.component';
import { TagsService } from './tags.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TagGroup, TagVisibility } from '@learnhub/models';

describe('TagsComponent', () => {
  let component: TagsComponent;
  let fixture: ComponentFixture<TagsComponent>;
  let tagsService: TagsService;

  const mockTagGroup: TagGroup = {
    id: '1',
    name: 'Math Topics',
    icon: 'calculator',
    visibility: TagVisibility.SEARCH_PAGE,
    tags: [
      { id: 't1', name: 'Algebra', icon: 'tag' },
      { id: 't2', name: 'Geometry', icon: 'tag' },
    ],
  };

  const mockTagGroupsResponse = { data: [mockTagGroup], total: 1 };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagsComponent],
      providers: [
        TagsService,
        ConfirmationService,
        MessageService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    tagsService = TestBed.inject(TagsService);
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(TagsComponent);
    component = fixture.componentInstance;
  }

  it('should create and load tag groups on initialization', () => {
    jest.spyOn(tagsService, 'getTagGroups').mockReturnValue(of(mockTagGroupsResponse));
    createComponent();

    expect(component).toBeTruthy();
    expect(component.tagGroups()).toEqual(mockTagGroupsResponse.data);
  });

  it('should select a tag group and load its details', () => {
    jest.spyOn(tagsService, 'getTagGroups').mockReturnValue(of(mockTagGroupsResponse));
    jest.spyOn(tagsService, 'getTagGroup').mockReturnValue(of(mockTagGroup));
    createComponent();

    component.selectTagGroup(mockTagGroup);

    expect(component.selectedTagGroup()).toEqual(mockTagGroup);
  });

  it('should open create tag group dialog', () => {
    jest.spyOn(tagsService, 'getTagGroups').mockReturnValue(of(mockTagGroupsResponse));
    createComponent();

    component.openCreateTagGroupDialog();

    expect(component.dialogVisible()).toBe(true);
    expect(component.editMode()).toBe(false);
  });

  it('should get visibility label', () => {
    jest.spyOn(tagsService, 'getTagGroups').mockReturnValue(of(mockTagGroupsResponse));
    createComponent();

    expect(component.getVisibilityLabel(TagVisibility.SEARCH_PAGE)).toBe('Search Page');
    expect(component.getVisibilityLabel(TagVisibility.TAG_SELECT)).toBe('Tag Select');
  });
});
