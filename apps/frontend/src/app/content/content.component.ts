import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ContentDataService, Exercise, LearningContent } from '../content-data.service';
import { MathPipe } from '../math.pipe';
import { AccordionModule } from 'primeng/accordion';
import { MatIcon } from '@angular/material/icon';
import { SectionComponent } from '../section/section.component';
import { DatePipe } from '@angular/common';
import { BadgeModule } from 'primeng/badge';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ButtonModule } from 'primeng/button';
import { FolderService } from '../folder.service';
import { ActionButtonsComponent } from '../action-buttons/action-buttons.component';
import { ToastService } from '../toast.service';
import { MessageService } from 'primeng/api';

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
  ],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss',
})
export class ContentComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected contentService = inject(ContentDataService);
  private messageService = inject(MessageService);
  private folderService = inject(FolderService);
  id = this.route.snapshot.paramMap.get('id');

  constructor() {
    if (this.id === undefined) throw new Error();
    if (this.id) {
      this.contentService.selectedId.set(this.id);
      if (!this.contentService.activeExercise()) {
        this.messageService.add({
          severity: 'error',
          summary: 'Content not found',
          detail: 'The content you requested could not be found.',
        });
        this.router.navigate(['/']);
      }
    }
  }
}
