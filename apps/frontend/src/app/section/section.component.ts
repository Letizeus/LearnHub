import { Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'lh-section',
  imports: [MatIcon],
  templateUrl: './section.component.html',
  styleUrl: './section.component.scss',
})
export class SectionComponent {
  icon = input<string>();
  label = input.required<string>();
  horizontal = input<boolean>(false);
}
