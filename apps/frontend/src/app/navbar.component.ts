import { Component, computed, effect, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { Button, ButtonDirective, ButtonLabel, ButtonIcon } from 'primeng/button';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { Toast } from 'primeng/toast';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'lh-navbar',
  imports: [MatIconModule, Button, RouterLink, ButtonDirective, ButtonLabel, ButtonIcon, Toast],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  standalone: true,
})
export class NavbarComponent {
  private router = inject(Router);
  protected auth = inject(AuthService);

  // Track the current URL via Router events
  private currentPath = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
  );

  current = computed(() => {
    const url = this.currentPath() || '';
    return this.routes.findIndex(e => url === e.routerLink);
  });

  routes = [
    { routerLink: '/', label: 'Home', icon: 'home' },
    { routerLink: '/search', label: 'Search', icon: 'search' },
    { routerLink: '/add', label: 'Upload new item', icon: 'note_add' },
    { routerLink: '/folder', label: 'Folder', icon: 'folder' },
    { routerLink: '/logout', label: 'Logout', icon: 'logout' },
  ];
}
