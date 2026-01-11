import { Route } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { LayoutComponent } from './core/layout/layout.component';

export const appRoutes: Route[] = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent),
    data: { breadcrumb: 'Login' },
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
        data: { breadcrumb: 'Dashboard' },
        canActivate: [authGuard],
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/users/users.component').then(
            (m) => m.UsersComponent
          ),
        data: { breadcrumb: 'Users' },
        canActivate: [authGuard],
      },
      {
        path: 'courses',
        loadComponent: () =>
          import('./features/courses/courses.component').then(
            (m) => m.CoursesComponent
          ),
        data: { breadcrumb: 'Courses' },
        canActivate: [authGuard],
      },
      {
        path: 'content',
        loadComponent: () =>
          import('./features/content/content.component').then(
            (m) => m.ContentComponent
          ),
        data: { breadcrumb: 'Content' },
        canActivate: [authGuard],
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/categories/categories.component').then(
            (m) => m.CategoriesComponent
          ),
        data: { breadcrumb: 'Categories' },
        canActivate: [authGuard],
      },
      {
        path: 'configuration',
        loadComponent: () =>
          import('./features/configuration/configuration.component').then(
            (m) => m.ConfigurationComponent
          ),
        data: { breadcrumb: 'Configuration' },
        canActivate: [authGuard],
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
