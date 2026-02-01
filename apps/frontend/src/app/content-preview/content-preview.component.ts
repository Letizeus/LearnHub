import { Component, computed, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MathPipe } from '../math.pipe';
import { Exercise } from 'models';
import { FolderService } from '../folder.service';
import { ActionButtonsComponent } from '../action-buttons/action-buttons.component';
import { Drawer } from 'primeng/drawer';
import { FolderComponent } from '../folder/folder.component';
import { NgxLongPress2Module } from 'ngx-long-press2';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'lh-content-preview',
  imports: [DatePipe, MatIcon, MathPipe, NgxLongPress2Module, ActionButtonsComponent, Drawer, FolderComponent, RouterLink],
  templateUrl: './content-preview.component.html',
  styleUrl: './content-preview.component.scss',
})
export class ContentPreviewComponent {
  folderService = inject(FolderService);

  isSelected = computed(() => {
    const selectModeFolder = this.folderService.folders().find(e => this.folderService.selectMode() == e.id);
    if (selectModeFolder && selectModeFolder?.content.includes(this.data().id)) return true;
    return false;
  });

  data = input.required<Exercise>();

  quickAction = signal<boolean>(false);

  handleLongPressMenu() {
    this.quickAction.update(() => true);
  }

  addToFolder() {
    if (this.isSelected()) {
      this.folderService.removeFromFolder(this.data().id, this.folderService.selectMode());
    } else {
      this.folderService.addToFolder(this.data().id, this.folderService.selectMode());
    }
  }
}
