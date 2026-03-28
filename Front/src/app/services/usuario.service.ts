import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { UsuarioDto, UsuarioUpdateDto } from '../core/models/models';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/usuarios`;

  getPerfil(): Observable<UsuarioDto> {
    return this.http.get<UsuarioDto>(`${this.url}/perfil`);
  }

  // ✅ Búsqueda segura restringida por departamento en el backend
  buscar(query: string): Observable<UsuarioDto[]> {
    return this.http.get<UsuarioDto[]>(`${this.url}/buscar?query=${query}`);
  }

  // --- MÉTODOS DE ADMIN ---
  getUsuarios(): Observable<UsuarioDto[]> {
    return this.http.get<UsuarioDto[]>(this.url);
  }

  deleteUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  updateUsuario(id: number, data: UsuarioUpdateDto): Observable<UsuarioDto> {
    return this.http.put<UsuarioDto>(`${this.url}/${id}`, data);
  }

  getDepartamentos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/departamentos`);
  }
}
