import { Component, computed, inject, input } from '@angular/core';
import { Button, ButtonModule } from 'primeng/button';
import { MatIcon } from '@angular/material/icon';
import { TableModule } from 'primeng/table';
import { FolderService } from '../folder.service';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DialogService } from 'primeng/dynamicdialog';
import { CreateFolderModalComponent } from '../create-folder-modal/create-folder-modal.component';

@Component({
  selector: 'lh-folder',
  imports: [Button, MatIcon, TableModule, DialogModule, InputTextModule, ButtonModule],
  templateUrl: './folder.component.html',
  styleUrl: './folder.component.scss',
})
export class FolderComponent {
  folderService = inject(FolderService);
  private dialogService = inject(DialogService);

  content = input<string>();

  foldersWithOutLiked = computed(() => this.folderService.folders().filter(folder => folder.id != 'liked'));

  constructor() {}

  handleAddtoFolder(id: string) {
    this.folderService.addToFolder(this.content()!, id);
  }

  handleRemoveFromFolder(id: string) {
    this.folderService.removeFromFolder(this.content()!, id);
  }

  handleCreateFolder() {
    this.dialogService.open(CreateFolderModalComponent, {
      header: 'Create new folder',
    });
  }
}
