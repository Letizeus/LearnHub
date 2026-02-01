import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ContentDataService } from '../content-data.service';
import { FolderService } from '../folder.service';
import { ButtonModule } from 'primeng/button';
import { NgxPrintDirective } from 'ngx-print';

@Component({
  selector: 'lh-action-buttons',
  imports: [MatIcon, NgxPrintDirective, ButtonModule],
  templateUrl: './action-buttons.component.html',
  styleUrl: './action-buttons.component.scss',
})
export class ActionButtonsComponent {
  protected contentService = inject(ContentDataService);
  private folderService = inject(FolderService);

  id = input.required<string>();
  small = input<boolean>(false);

  liked = computed<boolean>(() => {
    if (!this.folderService.likedFolder()) return false;
    else return this.folderService.likedFolder().content.includes(this.id());
  });

  constructor() {}

  handleLike() {
    this.folderService.like(this.id());
  }

  generatePdf() {
    const content = document.getElementById('pdf-content');

  }
}
