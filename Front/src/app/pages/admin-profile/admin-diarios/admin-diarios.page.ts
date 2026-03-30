import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { addIcons } from 'ionicons';
import {
  bookOutline, searchOutline, trashOutline,
  chatbubbleEllipsesOutline, sendOutline,
  timeOutline, personCircleOutline, arrowBackOutline,
  chevronForwardOutline, globeOutline, lockClosedOutline
} from 'ionicons/icons';

import {
  IonContent, IonIcon, IonInfiniteScroll, IonInfiniteScrollContent,
  AlertController, ToastController, IonSpinner
} from '@ionic/angular/standalone';

// ... (Interfaces se mantienen igual) ...

@Component({
  selector: 'app-admin-diarios',
  templateUrl: './admin-diarios.page.html',
  styleUrls: ['./admin-diarios.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonSpinner
  ]
})
export class AdminDiariosPage implements OnInit {
  private http = inject(HttpClient);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private apiUrl = environment.apiUrl;

  vista = signal<'USUARIOS' | 'DIARIOS'>('USUARIOS');
  usuarios = signal<any[]>([]);
  usuariosFiltrados = signal<any[]>([]);
  usuarioSeleccionado: any | null = null;
  diarios = signal<any[]>([]);

  page = signal<number>(0);
  size = 15;
  totalPages = signal<number>(0);
  cargando = signal<boolean>(false);

  constructor() {
    addIcons({
      bookOutline, searchOutline, trashOutline,
      chatbubbleEllipsesOutline, sendOutline,
      timeOutline, personCircleOutline, arrowBackOutline,
      chevronForwardOutline, globeOutline, lockClosedOutline
    });
  }

  ngOnInit() { this.cargarUsuarios(); }

  cargarUsuarios() {
    this.cargando.set(true);
    this.http.get<any[]>(`${this.apiUrl}/usuarios`).subscribe({
      next: (res) => { this.usuarios.set(res); this.usuariosFiltrados.set(res); this.cargando.set(false); },
      error: () => { this.cargando.set(false); this.presentToast('Error al cargar usuarios', 'danger'); }
    });
  }

  buscarUsuario(event: any) {
    const texto = event.target.value.toLowerCase();
    this.usuariosFiltrados.set(this.usuarios().filter(u => u.nombre.toLowerCase().includes(texto) || u.email.toLowerCase().includes(texto)));
  }

  seleccionarUsuario(user: any) { this.usuarioSeleccionado = user; this.vista.set('DIARIOS'); this.cargarDiarios(true); }
  volverALista() { this.usuarioSeleccionado = null; this.diarios.set([]); this.vista.set('USUARIOS'); }

  cargarDiarios(reset: boolean = false, event?: any) {
    if (!this.usuarioSeleccionado) return;
    if (reset) { this.page.set(0); this.diarios.set([]); this.cargando.set(true); }
    const url = `${this.apiUrl}/diarios/usuario/${this.usuarioSeleccionado.id}?page=${this.page()}&size=${this.size}&sort=fechaCreacion,desc`;
    this.http.get<any>(url).subscribe({
      next: (res) => {
        const nuevos = res.content || [];
        this.diarios.set(reset ? nuevos : [...this.diarios(), ...nuevos]);
        this.totalPages.set(res.totalPages);
        this.cargando.set(false);
        if (event) event.target.complete();
      },
      error: () => { this.cargando.set(false); if (event) event.target.complete(); this.presentToast('Error al cargar diarios', 'danger'); }
    });
  }

  loadMore(event: any) {
    if (this.page() < this.totalPages() - 1) { this.page.set(this.page() + 1); this.cargarDiarios(false, event); }
    else { event.target.disabled = true; }
  }

  toggleComentarios(diario: any) {
    diario.mostrarComentarios = !diario.mostrarComentarios;
    if (diario.mostrarComentarios && !diario.listaComentarios) {
      diario.cargandoComentarios = true;
      this.http.get<any[]>(`${this.apiUrl}/diarios/${diario.id}/comentarios`).subscribe({
        next: (coms) => { diario.listaComentarios = coms; diario.cargandoComentarios = false; this.diarios.set([...this.diarios()]); },
        error: () => { diario.cargandoComentarios = false; this.diarios.set([...this.diarios()]); this.presentToast('Error', 'danger'); }
      });
    }
    this.diarios.set([...this.diarios()]);
  }

  enviarComentario(diario: any) {
    if (!diario.nuevoComentario?.trim()) return;
    const texto = diario.nuevoComentario;
    diario.nuevoComentario = '';
    this.http.post<any>(`${this.apiUrl}/diarios/${diario.id}/comentarios`, { texto }).subscribe({
      next: (nuevo) => { if (!diario.listaComentarios) diario.listaComentarios = []; diario.listaComentarios.push(nuevo); this.diarios.set([...this.diarios()]); },
      error: () => { diario.nuevoComentario = texto; this.diarios.set([...this.diarios()]); this.presentToast('Error', 'danger'); }
    });
  }

  async borrarDiario(id: number) {
    const alert = await this.alertCtrl.create({
        header: '¿Eliminar entrada?', message: 'Esta acción no se puede deshacer.',
        buttons: [{ text: 'Cancelar', role: 'cancel' }, { text: 'Eliminar', role: 'destructive', handler: () => {
              this.http.delete(`${this.apiUrl}/diarios/${id}`).subscribe({
                next: () => { this.diarios.set(this.diarios().filter(d => d.id !== id)); this.presentToast('Entrada eliminada', 'success'); },
                error: () => this.presentToast('Error', 'danger')
              });
            }}]
      });
      await alert.present();
  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 2000, color, position: 'bottom' });
    toast.present();
  }
}
