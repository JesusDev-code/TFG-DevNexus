import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth, idToken } from '@angular/fire/auth';
import { switchMap, take } from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);

  // ⚠️ ELIMINA EL IF QUE COMPRUEBA LA URL ESPECÍFICA DE RENDER
  // Queremos enviar el token siempre que hagamos peticiones a NUESTRA API,
  // sea localhost o Render.
  
  return idToken(auth).pipe(
    take(1),
    switchMap((token) => {
      if (token) {
        const authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        return next(authReq);
      }
      return next(req);
    })
  );
};