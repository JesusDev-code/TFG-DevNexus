import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export type Plataforma = 'WEB' | 'ANDROID' | 'IOS';

@Injectable({ providedIn: 'root' })
export class FcmTokenService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/usuarios/fcm-tokens`;

  registrar(token: string, plataforma: Plataforma): Observable<void> {
    return this.http.post<void>(this.url, { token, plataforma });
  }

  eliminar(token: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${encodeURIComponent(token)}`);
  }
}
