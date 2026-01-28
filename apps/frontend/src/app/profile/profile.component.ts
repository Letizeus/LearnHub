import { Component } from '@angular/core';
import { Button } from 'primeng/button';
import { MatIcon } from '@angular/material/icon';
import { StartSectionComponent } from '../start/start-section.component';

@Component({
  selector: 'lh-profile',
  imports: [Button, MatIcon, StartSectionComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {}
