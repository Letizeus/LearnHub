import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { inject } from '@angular/core';
import { SessionService } from '../services/session.service';

/**
 * Adds the API base URL to relative HTTP requests,
 * and includes an Authorization header with the JWT token if the user is logged in.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(SessionService);
  const token = session.token();

  // Clone request with API base for relative URLs and auth header if logged in
  const apiReq = req.clone({
    url: req.url.startsWith('http')
      ? req.url
      : `${environment.apiBaseUrl}${req.url}`,
    setHeaders: token ? { Authorization: `Bearer ${token}` } : {},
  });

  return next(apiReq);
};
