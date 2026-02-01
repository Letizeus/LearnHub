import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { SessionService } from '../services/session.service';

/**
 * Route guard that protects admin routes.
 * Redirects unauthenticated users to /login.
 */
export const authGuard: CanActivateFn = (
  _route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot
): boolean | UrlTree => {
  const session = inject(SessionService);
  const router = inject(Router);

  // Allow access if session has a valid token
  if (session.token()) {
    return true;
  }

  // No token -> redirect to login
  return router.createUrlTree(['/login']);
};
