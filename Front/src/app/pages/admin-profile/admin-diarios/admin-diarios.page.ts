import { Component, OnInit, inject, signal, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { addIcons } from 'ionicons';
import {
  bookOutline, searchOutline, timeOutline, personCircleOutline,
  arrowBackOutline, chevronForwardOutline, globeOutline, lockClosedOutline,
  eyeOutline
} from 'ionicons/icons';

import { IonIcon, ToastController, IonSpinner } from '@ionic/angular/standalone';
import { DiarioDto, DiarioTemaDto } from 'src/app/core/models/models';
import { DiarioService } from 'src/app/services/diario.service';
import { IdeViewComponent } from '../../user-profile/user-diary/ide-view/ide-view.component';

@Component({
  selector: 'app-admin-diarios',
  templateUrl: './admin-diarios.page.html',
  styleUrls: ['./admin-diarios.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, FormsModule, IonIcon, IonSpinner, IdeViewComponent]
})
export class AdminDiariosPage implements OnInit {
  private http = inject(HttpClient);
  private toastCtrl = inject(ToastController);
  private cdr = inject(ChangeDetectorRef);
  private diarioService = inject(DiarioService);
  private apiUrl = environment.apiUrl;

  vista = signal<'USUARIOS' | 'TEMAS' | 'IDE'>('USUARIOS');
  usuarios = signal<any[]>([]);
  usuariosFiltrados = signal<any[]>([]);
  usuarioSeleccionado: any | null = null;

  temas = signal<DiarioTemaDto[]>([]);
  temaSeleccionado: DiarioTemaDto | null = null;

  diarios = signal<DiarioDto[]>([]);

  cargando = signal<boolean>(false);
  errorCargaUsuarios = signal<string | null>(null);

  get overrideCommitsForTema(): DiarioDto[] {
    if (!this.temaSeleccionado) return [];
    return this.diarios()
      .filter(d => d.temaId === this.temaSeleccionado!.id)
      .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());
  }

  constructor() {
    addIcons({
      bookOutline, searchOutline, timeOutline, personCircleOutline,
      arrowBackOutline, chevronForwardOutline, globeOutline, lockClosedOutline,
      eyeOutline
    });
  }

  ngOnInit() { this.cargarUsuarios(); }

  cargarUsuarios() {
    this.cargando.set(true);
    this.errorCargaUsuarios.set(null);
    this.http.get<any>(`${this.apiUrl}/usuarios`).subscribe({
      next: (res) => {
        const usuarios = this.normalizarLista(res);
        this.usuarios.set(usuarios);
        this.usuariosFiltrados.set(usuarios);
        this.cargando.set(false);
        this.cdr.markForCheck();
      },
      error: (err) => {
        if (err?.status === 401 || err?.status === 403) {
          this.cargarUsuariosFallbackPorDepartamento();
          return;
        }
        this.cargando.set(false);
        const msg = err?.error?.message || 'Error al cargar usuarios';
        this.errorCargaUsuarios.set(msg);
        this.presentToast(msg, 'danger');
        this.cdr.markForCheck();
      }
    });
  }

  private cargarUsuariosFallbackPorDepartamento() {
    this.http.get<any>(`${this.apiUrl}/usuarios/perfil`).subscribe({
      next: (perfil) => {
        const deptoId = perfil?.departamentoId;
        if (!deptoId) {
          this.cargando.set(false);
          this.errorCargaUsuarios.set('Sin permisos para listar usuarios en administración');
          this.presentToast('Sin permisos para listar usuarios', 'warning');
          return;
        }
        this.http.get<any>(`${this.apiUrl}/usuarios/por-departamento/${deptoId}`).subscribe({
          next: (res) => {
            const usuarios = this.normalizarLista(res);
            this.usuarios.set(usuarios);
            this.usuariosFiltrados.set(usuarios);
            this.cargando.set(false);
            this.presentToast('Mostrando usuarios de tu departamento', 'medium');
            this.cdr.markForCheck();
          },
          error: (err2) => {
            this.cargando.set(false);
            const msg = err2?.error?.message || 'Error al cargar usuarios';
            this.errorCargaUsuarios.set(msg);
            this.presentToast(msg, 'danger');
            this.cdr.markForCheck();
          }
        });
      },
      error: (err3) => {
        this.cargando.set(false);
        const msg = err3?.error?.message || 'Error al validar permisos';
        this.errorCargaUsuarios.set(msg);
        this.presentToast(msg, 'danger');
        this.cdr.markForCheck();
      }
    });
  }

  buscarUsuario(event: any) {
    const texto = event.target.value.toLowerCase();
    this.usuariosFiltrados.set(
      this.usuarios().filter(u =>
        u.nombre.toLowerCase().includes(texto) || u.email.toLowerCase().includes(texto)
      )
    );
    this.cdr.markForCheck();
  }

  seleccionarUsuario(user: any) {
    this.usuarioSeleccionado = user;
    this.temaSeleccionado = null;
    this.temas.set([]);
    this.diarios.set([]);
    this.vista.set('TEMAS');
    this.cargarTemasDelUsuario();
    this.cdr.markForCheck();
  }

  volverALista() {
    this.usuarioSeleccionado = null;
    this.temaSeleccionado = null;
    this.temas.set([]);
    this.diarios.set([]);
    this.vista.set('USUARIOS');
    this.cdr.markForCheck();
  }

  seleccionarTema(tema: DiarioTemaDto) {
    this.temaSeleccionado = tema;
    this.vista.set('IDE');
    // Cargar diarios del usuario para tener los commits disponibles como overrideCommits
    if (this.diarios().length === 0) {
      this.cargarDiarios();
    }
    this.cdr.markForCheck();
  }

  volverATemas() {
    this.temaSeleccionado = null;
    this.vista.set('TEMAS');
    this.cdr.markForCheck();
  }

  private cargarTemasDelUsuario() {
    const userId = this.getUserId(this.usuarioSeleccionado);
    if (!userId) {
      this.presentToast('No se pudo identificar el usuario', 'warning');
      return;
    }
    this.cargando.set(true);
    this.diarioService.getTemasByUserId(userId).subscribe({
      next: (temas) => {
        this.temas.set(temas);
        this.cargando.set(false);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.cargando.set(false);
        const msg = err?.error?.message || 'Error al cargar proyectos';
        this.presentToast(msg, 'danger');
        this.cdr.markForCheck();
      }
    });
  }

  private cargarDiarios() {
    const userId = this.getUserId(this.usuarioSeleccionado);
    if (!userId) return;
    const url = `${this.apiUrl}/diarios/usuario/${userId}?page=0&size=200&sort=fechaCreacion,desc`;
    this.http.get<any>(url).subscribe({
      next: (res) => {
        this.diarios.set(this.normalizarLista(res) as DiarioDto[]);
        this.cdr.markForCheck();
      },
      error: () => {}
    });
  }

  getEntradaCount(temaId: number): number {
    return this.diarios().filter(d => d.temaId === temaId).length;
  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 2000, color, position: 'bottom' });
    toast.present();
  }

  onAvatarError(event: Event, user?: any) {
    const target = event.target as HTMLImageElement | null;
    if (!target) return;
    const fallback = '/assets/avatars/avatar1.png';
    if (target.src.endsWith(fallback)) return;
    target.src = fallback;
    if (user) {
      user.foto_perfil = fallback;
    }
  }

  trackByUserId(_index: number, user: any) {
    return user?.id ?? user?.usuarioId ?? user?.email ?? _index;
  }

  trackByTemaId(_index: number, tema: DiarioTemaDto) {
    return tema.id ?? _index;
  }

  private normalizarLista(payload: any): any[] {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.content)) return payload.content;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  }

  private getUserId(user: any): number | null {
    const candidate = user?.id ?? user?.usuarioId ?? user?.userId ?? user?.idUsuario;
    const asNumber = Number(candidate);
    return Number.isFinite(asNumber) && asNumber > 0 ? asNumber : null;
  }
}
