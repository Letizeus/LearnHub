import { Component, inject, signal } from '@angular/core';
import { FolderService } from '../folder.service';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { CreateFolderModalComponent } from '../create-folder-modal/create-folder-modal.component';

@Component({
  selector: 'lh-folder-page',
  imports: [MatIcon, RouterLink, Button],
  templateUrl: './folder-page.component.html',
  styleUrl: './folder-page.component.scss',
})
export class FolderPageComponent {
  folderService = inject(FolderService);
  dialogService = inject(DialogService);

  constructor() {}

  createFolder() {
    this.dialogService.open(CreateFolderModalComponent, {
      header: 'Create new folder',
    });
  }
}
