import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-configuration',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './configuration.component.html',
  styleUrl: './configuration.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfigurationComponent {}
