// src/app/core/guards/admin.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

export const adminGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  await authService.waitForAuthReady();

  if (authService.isAuthenticated && authService.isAdmin) {
    return true;
  }

  router.navigate(['/user-profile']);
  return false;
};
