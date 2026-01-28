import { Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MathPipe } from '../math.pipe';
import { DatePipe } from '@angular/common';
import { Exercise, LearningContent } from '../content-data.service';

@Component({
  selector: 'lh-search-item',
  imports: [MatIcon, MathPipe, DatePipe],
  templateUrl: './search-item.component.html',
  styleUrl: './search-item.component.scss',
})
export class SearchItemComponent {
  data = input<Exercise>();
  explictShow = input<boolean>(false);
}
