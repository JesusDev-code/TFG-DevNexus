// src/app/core/guards/admin.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Tiene que estar logueado Y ADEMÁS ser Admin
  if (authService.isAuthenticated && authService.isAdmin) {
    return true;
  } else {
    // Si es un usuario normal intentando entrar a admin, lo mandamos a su perfil
    router.navigate(['/user-profile']);
    return false;
  }
};