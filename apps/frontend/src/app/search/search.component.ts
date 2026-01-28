import { Component, computed, effect, inject, input, resource, signal } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { MatIcon } from '@angular/material/icon';
import { SearchItemComponent } from '../search-item/search-item.component';
import { Button, ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SectionComponent } from '../section/section.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Chip } from 'primeng/chip';
import { SlicePipe } from '@angular/common';
import { DrawerModule } from 'primeng/drawer';
import { LongPressDirective } from '../long-press.directive';
import { TableModule } from 'primeng/table';
import { ContentDataService } from '../content-data.service';
import { FolderComponent } from '../folder/folder.component';
import { ActionButtonsComponent } from '../action-buttons/action-buttons.component';
import { DialogService } from 'primeng/dynamicdialog';
import { FolderSelectModalComponent } from '../folder-select-modal/folder-select-modal.component';
import { FolderService } from '../folder.service';
import { CollectionPreviewComponent } from '../collection-preview/collection-preview.component';
import { TagGroup, TagGroupPopulated, TagID, TagService, TagVisibilityPlace } from '../tag.service';
import { firstValueFrom, forkJoin } from 'rxjs';
import { Skeleton } from 'primeng/skeleton';

const visibilityFilter = (visibility: TagVisibilityPlace) => {
  return (e: TagGroup) => {
    for (const visibility of e.visibility) {
      if (visibility.place === TagVisibilityPlace.SEARCH_PAGE) return true;
    }
    return false;
  };
};

const visibilitySort = (visibility: TagVisibilityPlace) => {
  return (a: TagGroup, b: TagGroup) => {
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
    SearchItemComponent,
    Button,
    ButtonModule,
    SelectButtonModule,
    SectionComponent,
    Chip,
    SlicePipe,
    DrawerModule,
    LongPressDirective,
    TableModule,
    FolderComponent,
    ActionButtonsComponent,
    CollectionPreviewComponent,
    Skeleton,
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

  searchTagResource = resource({
    params: () => ({ tags: this.contentDataService.searchQuery()?.tags ?? [] }),
    loader: ({ params }) => {
      return Promise.all(params.tags.map(value => firstValueFrom(this.tagService.getTagById(value))));
    },
  });

  searchTags = computed(() => {
    if (this.searchTagResource.hasValue()) {
      return this.searchTagResource.value();
    }
    return [];
  });

  tagGroupsMainPage = resource<TagGroupPopulated[], { groups: TagGroup[] }>({
    params: () => ({ groups: this.tagService.tagGroupsArray() }),
    loader: async ({ params }) => {
      const groups = params.groups
        .filter(visibilityFilter(TagVisibilityPlace.SEARCH_PAGE))
        .sort(visibilitySort(TagVisibilityPlace.SEARCH_PAGE));
      return await firstValueFrom(forkJoin(groups.map(group => this.tagService.populateTagGroup(group))));
    },
  });

  tagGroupsSelect = resource<TagGroupPopulated[], { groups: TagGroup[] }>({
    params: () => ({ groups: this.tagService.tagGroupsArray() }),
    loader: async ({ params }) => {
      const groups = params.groups
        .filter(visibilityFilter(TagVisibilityPlace.TAG_SELECT))
        .sort(visibilitySort(TagVisibilityPlace.TAG_SELECT));
      return await firstValueFrom(forkJoin(groups.map(group => this.tagService.populateTagGroup(group))));
    },
  });

  tagSelect = false;
  foundExercises = [
    {
      id: '0',
      text: 'Bestimmen Sie die Inverse der Matrix $A$ über dem Körper $\\mathbb{R}$ mithilfe des Gauß-Jordan-Algorithmus: $$A = \\begin{pmatrix} 1 & 2 & 3 \\\\ 0 & 1 & 4 \\\\ 5 & 6 & 0 \\end{pmatrix}$$',
      course: 'Lineare Algebra',
      year: 'WS25/26',
      institution: 'RWTH Aachen',
    },
    {
      id: '1',
      text: 'Untersuchen Sie die folgende Reihe auf Konvergenz und absolute Konvergenz: $$\\sum_{n=1}^{\\infty} (-1)^n \\frac{n^2 + 1}{2n^3 + n}$$',
      course: 'Analysis I',
      year: 'WS25/26',
      institution: 'RWTH Aachen',
    },
    {
      id: '2',
      text: 'Konstruieren Sie einen deterministischen endlichen Automaten (DFA), der die Sprache $L = \\{w \\in \\{0,1\\}^* \\mid w \\text{ enthält die Teilfolge } 101\\}$ erkennt.',
      course: 'Formale Systeme, Automaten, Prozesse',
      year: 'SS25',
      institution: 'RWTH Aachen',
    },
    {
      id: '3',
      text: 'Geben Sie die asymptotische Laufzeit (O-Notation) für den folgenden Algorithmus in Abhängigkeit von $n$ an und begründen Sie Ihre Antwort: \\n\\n```python\\ndef example(n):\\n  sum = 0\\n  for i in range(n):\\n    for j in range(1, n, 2*j):\\n      sum += 1\\n  return sum\\n```',
      course: 'Datenstrukturen und Algorithmen',
      year: 'SS25',
      institution: 'RWTH Aachen',
    },
    {
      id: '4',
      text: 'Berechnen Sie die Wahrscheinlichkeit dafür, dass bei einem fairen Würfelwurf die Summe von zwei Würfeln genau 8 ergibt, unter der Bedingung, dass mindestens einer der Würfel eine 4 zeigt.',
      course: 'Stochastik für Informatiker',
      year: 'WS25/26',
      institution: 'RWTH Aachen',
    },
    {
      id: '5',
      text: 'Überführen Sie die folgende aussagenlogische Formel mithilfe der Äquivalenzgesetze in Konjunktive Normalform (KNF): $$F = \\neg (A \\lor (B \\land C)) \\to (A \\leftrightarrow B)$$',
      course: 'Mathematische Logik',
      year: 'SS25',
      institution: 'RWTH Aachen',
    },
  ];

  folder = [
    {
      id: '0',
      name: 'Liked',
      icon: 'star',
      amount: 10,
    },
    {
      id: '1',
      name: 'Test 1',
      amount: 12,
    },
    {
      id: '2',
      name: 'Test2',
      amount: 1,
    },
  ];

  quickAction = signal<string>('');

  isSearch = computed<boolean>(() => {
    const q = this.contentDataService.searchQuery();
    if (!q) return false;

    const hasQuery = (q.query?.trim()?.length ?? 0) > 0;
    const hasTags = (q.tags?.length ?? 0) > 0;

    return hasQuery || hasTags;
  });

  selectMode = signal<string>('');

  constructor() {
    // Search query
    const initialQ = this.route.snapshot.queryParamMap.get('q') ?? '';
    if (initialQ) {
      this.setSearchQuery(initialQ);
    }

    // Tags (including collections and institutions)
    const initialT = this.route.snapshot.queryParamMap.get('t') ?? '';
    if (initialT) {
      const tags = initialT.split(',');
      this.addTags(tags);
    }

    effect(() => {
      const q = this.contentDataService.searchQuery()?.query ?? '';
      const tags = this.contentDataService.searchQuery()?.tags ?? [];
      const currentQ = this.route.snapshot.queryParamMap.get('q') ?? '';
      const currentT = this.route.snapshot.queryParamMap.get('t') ?? '';

      if (q === currentQ && tags.join(',') === currentT) return;

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          q: q || undefined,
          t: tags.length > 0 ? tags.join(',') : undefined,
        },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    });
  }

  protected addTag(id: TagID) {
    this.contentDataService.searchQuery.update(q => {
      if (q) {
        if (q.tags && q.tags.length > 0) {
          return { ...q, tags: [...q.tags, id] };
        }
        return { ...q, tags: [id] };
      }
      return { query: '', tags: [id] };
    });
  }

  private addTags(ids: TagID[]) {
    this.contentDataService.searchQuery.update(q => {
      if (q) {
        if (q.tags && q.tags.length > 0) {
          return { ...q, tags: [...q.tags, ...ids] };
        }
        return { ...q, tags: ids };
      }
      return { query: '', tags: ids };
    });
  }

  protected removeTag(id: TagID) {
    this.contentDataService.searchQuery.update(q => {
      if (q) {
        if (q.tags && q.tags.length > 0) {
          let prevTags = q.tags;
          prevTags.splice(prevTags.indexOf(id), 1);
          return { ...q, tags: prevTags };
        }
        return { ...q };
      }
      return { query: '' };
    });
  }

  private setSearchQuery(q: string) {
    this.contentDataService.searchQuery.update(() => ({ query: q }));
  }

  handleCategorySelect(category: string) {
    // @ts-ignore
    this.contentDataService.searchQuery.update(q => ({ ...q, tags: category }));
  }

  handleSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.contentDataService.searchQuery.update(q => ({ ...q, query: input.value }));
  }

  handleLongPressMenu(id: string) {
    this.quickAction.update(() => id);
  }

  folderSelect() {
    if (this.selectMode() != '') {
      this.selectMode.update(() => '');
      return;
    }
    const ref = this.dialogService.open(FolderSelectModalComponent, {
      header: 'Select folder',
    });
    ref?.onClose.subscribe(folderId => {
      if (folderId) {
        this.selectMode.update(() => folderId);
      }
    });
  }

  addToFolder(id: string) {
    if (this.folderService.isInFolder(id, this.selectMode())) {
      this.folderService.removeFromFolder(id, this.selectMode());
      return;
    }
    this.folderService.addToFolder(id, this.selectMode());
  }

  protected readonly Math = Math;
}
