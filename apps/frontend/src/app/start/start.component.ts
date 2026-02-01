import { Component, inject } from '@angular/core';
import { NavbarComponent } from '../navbar.component';
import { ButtonModule } from 'primeng/button';
import { MatIcon } from '@angular/material/icon';
import { CollectionPreviewComponent } from '../collection-preview/collection-preview.component';
import { ContentDataService } from '../content-data.service';
import { SectionComponent } from '../section/section.component';
import { SkeletonModule } from 'primeng/skeleton';
import { ContentPreviewComponent } from '../content-preview/content-preview.component';

@Component({
  selector: 'lh-start',
  imports: [NavbarComponent, ButtonModule, MatIcon, SectionComponent, CollectionPreviewComponent, SkeletonModule, ContentPreviewComponent],
  templateUrl: './start.component.html',
  styleUrl: './start.component.scss',
  standalone: true,
})
export class StartComponent {
  protected readonly Math = Math;

  protected readonly contentService = inject(ContentDataService);

  constructor() {}
}
