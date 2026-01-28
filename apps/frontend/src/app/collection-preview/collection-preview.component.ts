import { AfterViewInit, Component, computed, inject, input, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { FastAverageColor } from 'fast-average-color';
import { Router, RouterLink } from '@angular/router';
import { LearningContentCollection } from '../content-data.service';

@Component({
  selector: 'lh-collection-preview',
  imports: [MatIcon, RouterLink],
  templateUrl: './collection-preview.component.html',
  styleUrl: './collection-preview.component.scss',
})
export class CollectionPreviewComponent {
  router = inject(Router);

  data = input.required<LearningContentCollection>();

  contentColor = computed(async () => {
    if (this.data().previewImage) {
      const fac = new FastAverageColor();
      const color = await fac.getColorAsync(this.data().previewImage!, {
        // Analyze only the bottom 30%
        top: 70, // Start 70% from the top
        height: 30, // Take 30% of the height
        left: 0,
        width: 100,
        algorithm: 'sqrt', // Highly accurate for luminance
      });

      // The library gives you 'isDark' and 'isLight' booleans automatically!
      console.log(color);
      return color.isDark ? 'white' : 'black';
    }
    return 'black';
  });
}
