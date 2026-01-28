import { Component, inject } from '@angular/core';
import { NavbarComponent } from '../navbar.component';
import { ButtonModule } from 'primeng/button';
import { MatIcon } from '@angular/material/icon';
import { StartSectionComponent } from './start-section.component';
import { CollectionPreviewComponent } from '../collection-preview/collection-preview.component';
import { ContentDataService, Exercise, LearningContent, LearningContentCollection } from '../content-data.service';
import { SectionComponent } from '../section/section.component';
import { SkeletonModule } from 'primeng/skeleton';
import { SearchItemComponent } from '../search-item/search-item.component';

@Component({
  selector: 'lh-start',
  imports: [NavbarComponent, ButtonModule, MatIcon, SectionComponent, CollectionPreviewComponent, SkeletonModule, SearchItemComponent],
  templateUrl: './start.component.html',
  styleUrl: './start.component.scss',
  standalone: true,
})
export class StartComponent {
  protected readonly Math = Math;

  protected readonly contentService = inject(ContentDataService);

  constructor() {}
}
