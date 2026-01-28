import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ContentDataService } from '../content-data.service';
import { FolderService } from '../folder.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'lh-action-buttons',
  imports: [MatIcon, SplitButtonModule, ButtonModule],
  templateUrl: './action-buttons.component.html',
  styleUrl: './action-buttons.component.scss',
})
export class ActionButtonsComponent {
  private contentService = inject(ContentDataService);
  private folderService = inject(FolderService);

  id = input.required<string>();
  small = input<boolean>(false);

  activeContent = computed(() => this.contentService.learningContent().find(content => content.id === this.id()));
  liked = computed<boolean>(() => this.folderService.likedFolder().documents.includes(this.id()));

  constructor() {}

  handleLike() {
    if (this.liked()) {
      this.contentService.removeLike(this.id());
      this.folderService.removeFromFolder(this.id(), 'liked');
    } else {
      this.contentService.addLike(this.id());
      this.folderService.addToFolder(this.id(), 'liked');
    }
  }
}
