import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { DiarioCreateDto, DiarioTemaCreateDto, DiarioTemaDto, Visibilidad } from '../core/models/models';

// Definimos esta interfaz aquí para las invitaciones
export interface InvitacionPendienteDto {
  id: number;
  temaTitulo: string;
  ownerNombre: string;
  fecha: string;
}

@Injectable({ providedIn: 'root' })
export class DiarioService {
  private http = inject(HttpClient);
  // Usamos la URL base definida en environment
  private url = environment.apiUrl;

  // ==========================================
  // 1. GESTIÓN DE TEMAS (PROYECTOS)
  // ==========================================

  getTemas(): Observable<DiarioTemaDto[]> { 
    return this.http.get<DiarioTemaDto[]>(`${this.url}/diario-temas`); 
  }
  
  crearTema(temaDto: DiarioTemaCreateDto): Observable<DiarioTemaDto> { 
    return this.http.post<DiarioTemaDto>(`${this.url}/diario-temas`, temaDto); 
  }

  borrarTema(id: number): Observable<void> { 
    return this.http.delete<void>(`${this.url}/diario-temas/${id}`); 
  }

  // ==========================================
  // 2. GESTIÓN DE COLABORACIÓN (INVITACIONES)
  // ==========================================

  // Enviar una invitación a otro usuario por email
  invitarColaborador(temaId: number, email: string): Observable<any> {
    return this.http.post(`${this.url}/diario-temas/${temaId}/invitar`, { email });
  }

  // Obtener invitaciones que me han enviado a mí y están pendientes
  getInvitacionesPendientes(): Observable<InvitacionPendienteDto[]> {
    return this.http.get<InvitacionPendienteDto[]>(`${this.url}/diario-temas/invitaciones/pendientes`);
  }

  // Aceptar (true) o Rechazar (false) una invitación
  responderInvitacion(invitacionId: number, aceptar: boolean): Observable<void> {
    return this.http.post<void>(
      `${this.url}/diario-temas/invitaciones/${invitacionId}/responder`, 
      {}, 
      { params: { aceptar: aceptar } }
    );
  }

  // ==========================================
  // 3. GESTIÓN DE DIARIOS (NOTAS/ENTRADAS)
  // ==========================================

  getMisEntradas(): Observable<any> { 
    return this.http.get(`${this.url}/diarios/mis-diarios?sort=fechaCreacion,desc`); 
  }

  // Obtener todas las entradas PÚBLICAS para el Blog
  getEntradasPublicas(): Observable<any> {
    return this.http.get(`${this.url}/diarios/publicos?sort=fechaCreacion,desc`);
  }

  crearEntrada(contenido: string, temaId: number, visibilidad: Visibilidad): Observable<any> {
    const body: DiarioCreateDto = {
      contenido: contenido,
      visibilidad: visibilidad, 
      temaId: temaId
    };
    return this.http.post<any>(`${this.url}/diarios`, body);
  }

  borrarEntrada(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/diarios/${id}`);
  }

  actualizarEntrada(id: number, contenido: string, visibilidad: Visibilidad, temaId: number): Observable<any> {
    const body: DiarioCreateDto = { contenido, visibilidad, temaId };
    return this.http.put<any>(`${this.url}/diarios/${id}`, body);
  }
}