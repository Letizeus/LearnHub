import { Component, contentChildren, input, TemplateRef } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { CollectionPreviewComponent } from '../collection-preview/collection-preview.component';

@Component({
  selector: 'lh-start-section',
  imports: [MatIcon],
  templateUrl: './start-section.component.html',
  styleUrl: './start-section.component.scss',
})
export class StartSectionComponent {
  icon = input<string>();
  label = input.required<string>();
  children = contentChildren(CollectionPreviewComponent, { read: TemplateRef });
}
