import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
// ✅ Importamos el nuevo DTO
import { TicketDto, TicketComentarioDto, TicketHistoricoDto } from '../core/models/models';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/tickets`;
  private urlHistorico = `${environment.apiUrl}/ticket-historico`; // ✅ URL para el historial

  getMisTickets(): Observable<TicketDto[]> {
    return this.http.get<TicketDto[]>(`${this.url}/mis-tickets`);
  }
  
  // --- MÉTODOS DE ADMIN ---
  getTicketsAdmin(): Observable<TicketDto[]> {
    return this.http.get<TicketDto[]>(this.url);
  }

  actualizarTicketAdmin(id: number, updates: Partial<TicketDto>): Observable<TicketDto> {
    return this.http.patch<TicketDto>(`${this.url}/${id}`, updates);
  }
  // ------------------------

  crearTicket(ticket: any): Observable<TicketDto> {
    return this.http.post<TicketDto>(this.url, ticket);
  }

  cambiarEstado(id: number, nuevoEstado: string, comentario?: string): Observable<TicketDto> {
    return this.http.put<TicketDto>(`${this.url}/${id}/estado`, { nuevoEstado, comentario });
  }

  getComentarios(ticketId: number): Observable<TicketComentarioDto[]> {
    return this.http.get<TicketComentarioDto[]>(`${this.url}/${ticketId}/comentarios`);
  }

  enviarComentario(ticketId: number, texto: string): Observable<TicketComentarioDto> {
    return this.http.post<TicketComentarioDto>(`${this.url}/${ticketId}/comentarios`, { texto });
  }

  // ✅ NUEVO: Obtener historial de un ticket
  getHistorico(ticketId: number): Observable<TicketHistoricoDto[]> {
    return this.http.get<TicketHistoricoDto[]>(`${this.urlHistorico}/ticket/${ticketId}`);
  }
}
