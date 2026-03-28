import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export interface NotificacionDto {
  id: number;
  mensaje: string;
  fecha: string; // LocalDateTime del backend llega como ISO string
  leida: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/notificaciones`;

  getMisNotificaciones(): Observable<NotificacionDto[]> {
    return this.http.get<NotificacionDto[]>(this.url);
  }

  marcarLeida(id: number): Observable<NotificacionDto> {
    return this.http.patch<NotificacionDto>(`${this.url}/${id}/leer`, {});
  }

  marcarTodasLeidas(): Observable<void> {
    return this.http.patch<void>(`${this.url}/leer-todas`, {});
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}