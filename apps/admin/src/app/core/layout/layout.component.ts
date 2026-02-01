import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Signal,
  computed,
} from '@angular/core';
import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
  Router,
} from '@angular/router';
import { navItems } from '../navigation';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  protected readonly items = navItems;
  protected readonly userLabel: Signal<string> = computed(
    () => this.session.user()?.displayName ?? 'Admin'
  );

  protected logout(): void {
    this.session.clear();
    this.router.navigateByUrl('/login');
  }
}
