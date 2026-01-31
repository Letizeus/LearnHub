import { Component, inject, viewChild } from '@angular/core';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FolderService } from '../folder.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'lh-create-folder-modal',
  imports: [Button, Dialog, InputText, FormsModule],
  templateUrl: './create-folder-modal.component.html',
  styleUrl: './create-folder-modal.component.css',
})
export class CreateFolderModalComponent {
  private folderService = inject(FolderService);
  nameInput: string = '';

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
  ) {}

  create() {
    this.folderService.createNewFolder(this.nameInput);
    this.close();
  }

  close(folderId?: string) {
    this.ref.close({ folderId: folderId });
  }
}
