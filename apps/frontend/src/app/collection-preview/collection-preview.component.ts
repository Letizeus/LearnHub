import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { FastAverageColor } from 'fast-average-color';
import { Router, RouterLink } from '@angular/router';
import { LearningContentCollection } from 'models';

@Component({
  selector: 'lh-collection-preview',
  imports: [MatIcon, RouterLink],
  templateUrl: './collection-preview.component.html',
  styleUrl: './collection-preview.component.scss',
})
export class CollectionPreviewComponent {
  router = inject(Router);

  data = input.required<LearningContentCollection>();
}
