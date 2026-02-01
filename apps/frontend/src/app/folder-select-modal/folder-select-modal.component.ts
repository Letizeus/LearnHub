import { Component, inject } from '@angular/core';
import { FolderService } from '../folder.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Button } from 'primeng/button';
import { Listbox } from 'primeng/listbox';
import { FormsModule } from '@angular/forms';
import { Folder } from 'models';

@Component({
  selector: 'lh-folder-select-modal',
  imports: [Button, Listbox, FormsModule],
  templateUrl: './folder-select-modal.component.html',
  styleUrl: './folder-select-modal.component.scss',
})
export class FolderSelectModalComponent {
  protected folderService = inject(FolderService);

  selection: Folder = { id: 'unknown', name: 'none', content: [], length: 0 };

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
  ) {}

  select(event: any) {
    this.close(event.value.id);
  }

  close(folderId?: string) {
    this.ref.close(folderId);
  }
}
