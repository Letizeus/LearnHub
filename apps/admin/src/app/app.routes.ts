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
        data: { breadcrumb: 'Dashboard', roles: ['admin'] },
        canActivate: [authGuard],
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/users/users.component').then(
            (m) => m.UsersComponent
          ),
        data: { breadcrumb: 'Users', roles: ['admin'] },
        canActivate: [authGuard],
      },
      {
        path: 'roles',
        loadComponent: () =>
          import('./features/roles/roles.component').then(
            (m) => m.RolesComponent
          ),
        data: { breadcrumb: 'Roles', roles: ['admin'] },
        canActivate: [authGuard],
      },
      {
        path: 'courses',
        loadComponent: () =>
          import('./features/courses/courses.component').then(
            (m) => m.CoursesComponent
          ),
        data: { breadcrumb: 'Courses', roles: ['admin'] },
        canActivate: [authGuard],
      },
      {
        path: 'content',
        loadComponent: () =>
          import('./features/content/content.component').then(
            (m) => m.ContentComponent
          ),
        data: { breadcrumb: 'Content', roles: ['admin'] },
        canActivate: [authGuard],
      },
      {
        path: 'moderation',
        loadComponent: () =>
          import('./features/moderation/moderation.component').then(
            (m) => m.ModerationComponent
          ),
        data: { breadcrumb: 'Moderation', roles: ['admin', 'moderator'] },
        canActivate: [authGuard],
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/categories/categories.component').then(
            (m) => m.CategoriesComponent
          ),
        data: { breadcrumb: 'Categories', roles: ['admin'] },
        canActivate: [authGuard],
      },
      {
        path: 'configuration',
        loadComponent: () =>
          import('./features/configuration/configuration.component').then(
            (m) => m.ConfigurationComponent
          ),
        data: { breadcrumb: 'Configuration', roles: ['admin'] },
        canActivate: [authGuard],
      },
      {
        path: 'audit',
        loadComponent: () =>
          import('./features/audit/audit.component').then(
            (m) => m.AuditComponent
          ),
        data: { breadcrumb: 'Audit Logs', roles: ['admin'] },
        canActivate: [authGuard],
      },
      {
        path: 'errors',
        loadComponent: () =>
          import('./features/errors/errors.component').then(
            (m) => m.ErrorsComponent
          ),
        data: { breadcrumb: 'Errors & Support', roles: ['admin', 'support'] },
        canActivate: [authGuard],
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
