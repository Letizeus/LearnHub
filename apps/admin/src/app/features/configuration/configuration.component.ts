import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

interface PlatformConfig {
  featureFlags: {
    enableFileUpload: boolean;
    enableCourseCreation: boolean;
  };
  limits: {
    maxUploadSizeMB: number;
  };
}

@Component({
  selector: 'app-configuration',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputNumberModule,
    ToggleSwitchModule,
  ],
  templateUrl: './configuration.component.html',
  styleUrl: './configuration.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfigurationComponent {
  readonly config = signal<PlatformConfig>({
    featureFlags: {
      enableFileUpload: true,
      enableCourseCreation: true,
    },
    limits: {
      maxUploadSizeMB: 50,
    },
  });

  saveConfiguration(): void {
    console.log('Saving configuration:', this.config());
  }
}
