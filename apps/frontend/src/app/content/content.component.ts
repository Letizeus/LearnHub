import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ContentDataService } from '../content-data.service';
import { MathPipe } from '../math.pipe';
import { AccordionModule } from 'primeng/accordion';
import { MatIcon } from '@angular/material/icon';
import { SectionComponent } from '../section/section.component';
import { DatePipe } from '@angular/common';
import { BadgeModule } from 'primeng/badge';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ButtonModule } from 'primeng/button';
import { ActionButtonsComponent } from '../action-buttons/action-buttons.component';
import { ContentPreviewComponent } from '../content-preview/content-preview.component';
import { TagService } from '../tag.service';
import { split } from '@angular-devkit/core';

@Component({
  selector: 'lh-content',
  imports: [
    MathPipe,
    AccordionModule,
    MatIcon,
    SectionComponent,
    DatePipe,
    BadgeModule,
    RouterLink,
    SplitButtonModule,
    ButtonModule,
    ActionButtonsComponent,
    ContentPreviewComponent,
  ],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss',
})
export class ContentComponent implements OnInit {
  private route = inject(ActivatedRoute);
  protected contentService = inject(ContentDataService);
  private tagService = inject(TagService);

  tags = computed(() => {
    return this.contentService
      .activeExercise()
      ?.tags.map(t => {
        if (typeof t !== 'string') return t;
        return this.tagService.tags().get(t);
      })
      .filter(t => !!t)
      .map(t => t.name)
      .join(', ');
  });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        if (this.contentService.selectedId() !== id) {
          window.scrollTo(0, 0);
          this.contentService.selectedId.set(id);
        }
      }
    });
  }

  protected readonly split = split;
}
