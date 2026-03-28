import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { ConversacionDto, MensajeDto, MensajeCreateDto } from '../core/models/models';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private http = inject(HttpClient);
  private urlConv = `${environment.apiUrl}/conversaciones`;
  private urlMsg = `${environment.apiUrl}/mensajes`;

  getConversaciones(): Observable<ConversacionDto[]> {
    return this.http.get<ConversacionDto[]>(this.urlConv);
  }

  // ✅ CORREGIDO: Ahora acepta 3 argumentos para coincidir con la llamada del componente
  crearConversacion(titulo: string, tipo: string, invitadoId?: number): Observable<ConversacionDto> {
  // Ahora aceptamos el tercer parámetro y lo enviamos al backend
  return this.http.post<ConversacionDto>(this.urlConv, { titulo, tipo, invitadoId });
}

  getMensajes(convId: number): Observable<MensajeDto[]> {
    return this.http.get<MensajeDto[]>(`${this.urlMsg}/conversacion/${convId}`);
  }

  enviarMensaje(dto: MensajeCreateDto): Observable<MensajeDto> {
    return this.http.post<MensajeDto>(this.urlMsg, dto);
  }
  marcarComoLeido(convId: number): Observable<void> {
  return this.http.put<void>(`${this.urlMsg}/leer-todo/${convId}`, {});
  }
  eliminarConversacion(id: number): Observable<void> {
  return this.http.delete<void>(`${this.urlConv}/${id}`);
  }
}