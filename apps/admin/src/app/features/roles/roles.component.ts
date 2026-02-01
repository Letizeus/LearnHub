import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolesComponent {}
