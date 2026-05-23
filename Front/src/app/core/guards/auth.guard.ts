// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  await authService.waitForAuthReady();

  if (authService.isAuthenticated) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
