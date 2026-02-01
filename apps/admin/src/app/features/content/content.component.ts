import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentComponent {}
