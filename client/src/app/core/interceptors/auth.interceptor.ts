import { HttpInterceptorFn } from '@angular/common/http';

import { AUTH_TOKEN_KEY } from '../config/api.config';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const accessToken: string | null = localStorage.getItem(AUTH_TOKEN_KEY);

  if (accessToken) {
    const authenticatedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return next(authenticatedRequest);
  }

  return next(req);
};
