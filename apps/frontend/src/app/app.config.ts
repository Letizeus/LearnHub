import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { appRoutes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';

import { providePrimeNG } from 'primeng/config'
import Aura from '@primeuix/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
<<<<<<< HEAD
    providePrimeNG({ theme: { preset: Aura }}),
    provideHttpClient()
=======
    providePrimeNG({
      theme: {
        preset: Aura,
      },
    }),
>>>>>>> b658a23ebbfd6f20995ac29e76533979b29a4870
  ],
};
