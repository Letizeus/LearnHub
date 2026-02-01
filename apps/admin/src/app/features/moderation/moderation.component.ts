import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-moderation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './moderation.component.html',
  styleUrl: './moderation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModerationComponent {}
