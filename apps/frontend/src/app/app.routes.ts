import { Route } from '@angular/router';
import { StartComponent } from './start/start.component';
import { SearchComponent } from './search/search.component';
import { ProfileComponent } from './profile/profile.component';
import { ContentComponent } from './content/content.component';
import { FolderPageComponent } from './folder-page/folder-page.component';
import { FolderViewComponent } from './folder-view/folder-view.component';

export const appRoutes: Route[] = [
  {
    path: 'folder/:id',
    component: FolderViewComponent,
  },
  {
    path: 'folder',
    component: FolderPageComponent,
  },
  {
    path: 'profile',
    component: ProfileComponent,
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
