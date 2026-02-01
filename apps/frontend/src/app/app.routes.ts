import { Route, Router } from '@angular/router';
import { StartComponent } from './start/start.component';
import { SearchComponent } from './search/search.component';
import { ProfileComponent } from './profile/profile.component';
import { ContentComponent } from './content/content.component';
import { FolderPageComponent } from './folder-page/folder-page.component';
import { FolderViewComponent } from './folder-view/folder-view.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { AuthService } from './core/auth.service';
import { inject } from '@angular/core';

export const appRoutes: Route[] = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'signup',
    component: SignupComponent,
  },
  {
    path: 'folder/:id',
    component: FolderViewComponent,
  },
  {
    path: 'folder',
    component: FolderPageComponent,
    canActivate: [() => inject(AuthService).isAuthenticated() || inject(Router).parseUrl('/login')],
  },
  {
    path: 'search',
    component: SearchComponent,
  },
  {
    path: 'content/:id',
    component: ContentComponent,
  },
  {
    path: '**',
    component: StartComponent,
  },
];
