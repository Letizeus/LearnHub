import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FolderService } from '../folder.service';
import { Button } from 'primeng/button';
import { MatIcon } from '@angular/material/icon';
import { FolderItemsComponent } from './folder-items/folder-items.component';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ContentPreviewComponent } from '../content-preview/content-preview.component';
import { NgxPrintDirective } from 'ngx-print';
import { ContentDataService } from '../content-data.service';

@Component({
  selector: 'lh-folder-view',
  imports: [Button, MatIcon, FolderItemsComponent, ConfirmDialogModule, ContentPreviewComponent, NgxPrintDirective],
  providers: [ConfirmationService],
  templateUrl: './folder-view.component.html',
  styleUrl: './folder-view.component.scss',
})
export class FolderViewComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  folderService = inject(FolderService);
  contentService = inject(ContentDataService)

  @ViewChild('folderName') inputElement!: ElementRef;

  editMode = false;

  constructor() {
    this.folderService.selectFolderId.set(this.route.snapshot.paramMap.get('id')!);
    if (!this.folderService.activeFolder()) {
      this.router.navigate(['/folder']);
      return;
    }
  }

  handleFolderChange() {
    this.editMode = false;
    this.folderService.updateFolder(this.folderService.activeFolder()!.id, {
      name: this.inputElement.nativeElement.value,
    });
  }

  confirmDelete(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure you want to delete this folder? This action cannot be undone.',
      header: 'Danger Zone',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancel',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Delete',
        severity: 'danger',
      },
      accept: () => {
        this.folderService.deleteFolder(this.folderService.activeFolder()!.id);
        this.router.navigate(['/folder']);
      },
    });
  }

  download() {
    for(const i of this.folderService.activeFolder()!.content) {
      this.contentService.download(i)
    }
    
  }
}
