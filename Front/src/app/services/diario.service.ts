import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { ColaboradorDto, DiarioComentario, DiarioCreateDto, DiarioDto, DiarioTemaCreateDto, DiarioTemaDto, ProyectoAnalisisDto, Visibilidad } from '../core/models/models';

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
  private url = environment.apiUrl;

  getTemas(): Observable<DiarioTemaDto[]> {
    return this.http.get<DiarioTemaDto[]>(`${this.url}/diario-temas`);
  }

  getTemasByUserId(userId: number): Observable<DiarioTemaDto[]> {
    return this.http.get<DiarioTemaDto[]>(`${this.url}/diario-temas/usuario/${userId}`);
  }
  
  crearTema(temaDto: DiarioTemaCreateDto): Observable<DiarioTemaDto> { 
    return this.http.post<DiarioTemaDto>(`${this.url}/diario-temas`, temaDto); 
  }

  borrarTema(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/diario-temas/${id}`);
  }

  actualizarTema(id: number, titulo: string, descripcion: string): Observable<DiarioTemaDto> {
    return this.http.patch<DiarioTemaDto>(`${this.url}/diario-temas/${id}`, { titulo, descripcion });
  }

  cambiarVisibilidadTema(
    id: number,
    visibilidad: Visibilidad,
    tituloPublicacion?: string,
    descripcionPublicacion?: string
  ): Observable<DiarioTemaDto> {
    return this.http.patch<DiarioTemaDto>(`${this.url}/diario-temas/${id}/visibilidad`, {
      visibilidad,
      tituloPublicacion,
      descripcionPublicacion
    });
  }

  getTemaPublicos(): Observable<DiarioTemaDto[]> {
    return this.http.get<DiarioTemaDto[]>(`${this.url}/diario-temas/publicos`);
  }

  getEntradasPublicasDeTema(temaId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/diarios/tema/${temaId}/publicos`);
  }

  getColaboradores(temaId: number): Observable<ColaboradorDto[]> {
    return this.http.get<ColaboradorDto[]>(`${this.url}/diario-temas/${temaId}/colaboradores`);
  }

  invitarColaborador(temaId: number, email: string): Observable<any> {
    return this.http.post(`${this.url}/diario-temas/${temaId}/invitar`, { email });
  }

  getInvitacionesPendientes(): Observable<InvitacionPendienteDto[]> {
    return this.http.get<InvitacionPendienteDto[]>(`${this.url}/diario-temas/invitaciones/pendientes`);
  }

  responderInvitacion(invitacionId: number, aceptar: boolean): Observable<void> {
    return this.http.post<void>(
      `${this.url}/diario-temas/invitaciones/${invitacionId}/responder`, 
      {}, 
      { params: { aceptar: aceptar } }
    );
  }

  getMisEntradas(): Observable<any> {
    return this.http.get(`${this.url}/diarios/mis-diarios?sort=fechaCreacion,desc`); 
  }

  getEntradasPublicas(): Observable<any> {
    return this.http.get(`${this.url}/diarios/publicos?sort=fechaCreacion,desc`);
  }

  crearEntrada(
    contenido: string,
    temaId: number,
    visibilidad: Visibilidad,
    tipo?: 'LOG' | 'FILE' | null,
    filename?: string
  ): Observable<any> {
    const body: any = { contenido, visibilidad, temaId };
    if (tipo) body['tipo'] = tipo;
    if (filename) body['filename'] = filename;
    return this.http.post<any>(`${this.url}/diarios`, body);
  }

  crearArchivoIDE(temaId: number, filename: string, contenido: string): Observable<DiarioDto> {
    const body: DiarioCreateDto = {
      contenido,
      visibilidad: 'PRIVADO',
      temaId,
      tipo: 'FILE',
      filename
    };
    return this.http.post<DiarioDto>(`${this.url}/diarios`, body);
  }

  getArchivosActuales(temaId: number): Observable<DiarioDto[]> {
    return this.http.get<DiarioDto[]>(`${this.url}/diarios/tema/${temaId}/archivos`);
  }

  analizarProyecto(temaId: number): Observable<ProyectoAnalisisDto> {
    return this.http.post<ProyectoAnalisisDto>(`${this.url}/diario-ai/analizar-proyecto/${temaId}`, {});
  }

  getComentarios(diarioId: number): Observable<DiarioComentario[]> {
    return this.http.get<DiarioComentario[]>(`${this.url}/diarios/${diarioId}/comentarios`);
  }

  agregarComentario(diarioId: number, texto: string): Observable<DiarioComentario> {
    return this.http.post<DiarioComentario>(`${this.url}/diarios/${diarioId}/comentarios`, { texto });
  }

  borrarEntrada(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/diarios/${id}`);
  }

  actualizarEntrada(id: number, contenido: string, visibilidad: Visibilidad, temaId: number): Observable<any> {
    const body: DiarioCreateDto = { contenido, visibilidad, temaId };
    return this.http.put<any>(`${this.url}/diarios/${id}`, body);
  }

  exportarTemaCsv(temaId: number): Observable<Blob> {
    return this.http.get(`${this.url}/diarios/tema/${temaId}/export.csv`, {
      responseType: 'blob'
    });
  }

  extraerCodigoDeImagen(imageBase64: string, mimeType: string): Observable<{ texto: string }> {
    return this.http.post<{ texto: string }>(`${this.url}/vision/extraer-codigo`, { imageBase64, mimeType });
  }

  codeReview(diarioId: number): Observable<{ review: string }> {
    return this.http.post<{ review: string }>(`${this.url}/diario-ai/code-review/${diarioId}`, {});
  }

  sugerirEtiquetas(contenido: string): Observable<{ etiquetas: string[] }> {
    return this.http.post<{ etiquetas: string[] }>(`${this.url}/diario-ai/sugerir-etiquetas`, { contenido });
  }

  resumirTema(temaId: number): Observable<{ resumen: string }> {
    return this.http.post<{ resumen: string }>(`${this.url}/diario-ai/resumir-tema/${temaId}`, {});
  }

  getComentariosTema(temaId: number): Observable<DiarioComentario[]> {
    return this.http.get<DiarioComentario[]>(`${this.url}/diario-temas/${temaId}/comentarios`);
  }

  agregarComentarioTema(temaId: number, texto: string): Observable<DiarioComentario> {
    return this.http.post<DiarioComentario>(`${this.url}/diario-temas/${temaId}/comentarios`, { texto });
  }

  getComentariosComunidad(temaId: number): Observable<DiarioComentario[]> {
    return this.http.get<DiarioComentario[]>(`${this.url}/diario-temas/${temaId}/comentarios/comunidad`);
  }

  agregarComentarioComunidad(temaId: number, texto: string): Observable<DiarioComentario> {
    return this.http.post<DiarioComentario>(`${this.url}/diario-temas/${temaId}/comentarios/comunidad`, { texto });
  }
}
