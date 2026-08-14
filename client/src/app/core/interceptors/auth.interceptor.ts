import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AUTH_TOKEN_KEY } from '../config/api.config';
import { AuthService } from '../services/auth.service';
import { LoginModalService } from '../services/login-modal.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService: AuthService = inject(AuthService);
  const loginModalService: LoginModalService = inject(LoginModalService);
  const router: Router = inject(Router);
  const accessToken: string | null = localStorage.getItem(AUTH_TOKEN_KEY);

  const authenticatedRequest = accessToken
    ? req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    : req;

  return next(authenticatedRequest).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        authService.clearSession();
        loginModalService.open();
        void router.navigate(['/publicCatalog']);
      }

      return throwError(() => error);
    }),
  );
};
