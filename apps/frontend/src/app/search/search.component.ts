import { Component, computed, effect, inject } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { MatIcon } from '@angular/material/icon';
import { Button, ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SectionComponent } from '../section/section.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Chip } from 'primeng/chip';
import { SlicePipe } from '@angular/common';
import { DrawerModule } from 'primeng/drawer';
import { TableModule } from 'primeng/table';
import { ContentDataService } from '../content-data.service';
import { DialogService } from 'primeng/dynamicdialog';
import { FolderSelectModalComponent } from '../folder-select-modal/folder-select-modal.component';
import { FolderService } from '../folder.service';
import { CollectionPreviewComponent } from '../collection-preview/collection-preview.component';
import { TagGroupPopulated, TagService } from '../tag.service';
import { Skeleton } from 'primeng/skeleton';
import { LearningContentCollection, TagID, TagVisibilityPlace } from 'models';
import { FormsModule } from '@angular/forms';
import { ContentPreviewComponent } from '../content-preview/content-preview.component';

const visibilityFilter = (visibility: TagVisibilityPlace) => {
  return (e: TagGroupPopulated) => {
    for (const v of e.visibility) {
      if (v.place === visibility) return true;
    }
    return false;
  };
};

const visibilitySort = (visibility: TagVisibilityPlace) => {
  return (a: TagGroupPopulated, b: TagGroupPopulated) => {
    const aPos = a.visibility.find(v => v.place === visibility)?.position ?? -1;
    const bPos = b.visibility.find(v => v.place === visibility)?.position ?? -1;
    return aPos - bPos;
  };
};

@Component({
  selector: 'lh-search',
  imports: [
    InputTextModule,
    MatIcon,
    Button,
    ButtonModule,
    SelectButtonModule,
    SectionComponent,
    Chip,
    SlicePipe,
    DrawerModule,
    TableModule,
    CollectionPreviewComponent,
    Skeleton,
    FormsModule,
    ContentPreviewComponent,
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent {
  contentDataService = inject(ContentDataService);

  folderService = inject(FolderService);

  dialogService = inject(DialogService);

  tagService = inject(TagService);

  private route = inject(ActivatedRoute);
  private router = inject(Router);

  searchString = '';

  searchTags = computed(() => {
    if (!this.contentDataService.searchQuery() || !this.contentDataService.searchQuery()!.tags) return [];
    return this.contentDataService.searchQuery()?.tags?.map(e => this.tagService.tags().get(e));
  });

  collection = computed<LearningContentCollection | undefined>(() => {
    if (!this.contentDataService.searchQuery() || !this.contentDataService.searchQuery()?.collection) return undefined;
    return this.contentDataService.learningContentCollections().get(this.contentDataService.searchQuery()!.collection!);
  });

  tagGroupsMainPage = computed<TagGroupPopulated[]>(() => {
    return this.tagService
      .tagGroupsPopulated()
      .filter(visibilityFilter(TagVisibilityPlace.SEARCH_PAGE))
      .sort(visibilitySort(TagVisibilityPlace.SEARCH_PAGE));
  });

  tagGroupsSelect = computed<TagGroupPopulated[]>(() => {
    return this.tagService
      .tagGroupsPopulated()
      .filter(visibilityFilter(TagVisibilityPlace.TAG_SELECT))
      .sort(visibilitySort(TagVisibilityPlace.TAG_SELECT));
  });

  tagSelect = false;

  isSearch = computed<boolean>(() => {
    const q = this.contentDataService.searchQuery();
    if (!q) return false;

    const hasQuery = (q.query?.trim()?.length ?? 0) > 0;
    const hasTags = (q.tags?.length ?? 0) > 0;
    const hasCollection = !!q.collection;

    return hasQuery || hasTags || hasCollection;
  });

  constructor() {
    this.tagService.init();
  }

  protected addTag(id: TagID) {
    this.tagSelect = false;
    if (this.contentDataService.searchQuery()?.tags?.includes(id)) return;
    this.router.navigate(['/search'], {
      queryParams: { t: id },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  protected removeTag(id: TagID) {
    const currentTags = this.contentDataService.searchQuery()?.tags ?? [];
    const newTags = currentTags.filter(e => e !== id);
    this.router.navigate(['/search'], {
      queryParams: { t: newTags.length ? newTags : null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  handleSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.router.navigate(['/search'], {
      queryParams: { q: input.value !== '' ? input.value : null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  folderSelect() {
    if (this.folderService.selectMode() != '') {
      this.folderService.selectMode.update(() => '');
      return;
    }
    const ref = this.dialogService.open(FolderSelectModalComponent, {
      header: 'Select folder',
    });
    ref?.onClose.subscribe(folderId => {
      if (folderId) {
        this.folderService.selectMode.update(() => folderId);
      }
    });
  }

  addToFolder(id: string) {
    if (this.folderService.isInFolder(id, this.folderService.selectMode())) {
      this.folderService.removeFromFolder(id, this.folderService.selectMode());
      return;
    }
    this.folderService.addToFolder(id, this.folderService.selectMode());
  }

  removeCollection() {
    this.router.navigate(['/search'], {
      queryParams: { c: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  protected readonly Math = Math;
}
