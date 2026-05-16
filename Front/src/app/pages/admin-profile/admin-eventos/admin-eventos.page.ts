import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { EventsService } from 'src/app/services/events.service';
import { Evento } from 'src/app/core/models/models';
import { addIcons } from 'ionicons';
import { 
  calendarOutline, timeOutline, locationOutline, 
  peopleOutline, trashOutline, createOutline, 
  searchOutline, addOutline, globeOutline, lockClosedOutline,
  closeOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-admin-eventos',
  templateUrl: './admin-eventos.page.html',
  styleUrls: ['./admin-eventos.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminEventosPage implements OnInit {
  private eventsService = inject(EventsService);
  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController);
  private cdr = inject(ChangeDetectorRef);

  eventos: Evento[] = [];
  eventosFiltrados: Evento[] = [];
  textoBusqueda: string = '';
  filtroVisibilidad: 'TODOS' | 'PUBLICO' | 'PRIVADO' = 'TODOS';
  modalAbierto = false;
  eventoEditando: Partial<Evento> = {};
  esEdicion = false;

  constructor() {
    addIcons({ calendarOutline, timeOutline, locationOutline, peopleOutline, trashOutline, createOutline, searchOutline, addOutline, globeOutline, lockClosedOutline, closeOutline });
  }

  ngOnInit() { this.cargarEventos(); }

  cargarEventos() {
    this.eventsService.getEventos().subscribe({
      next: (res) => { this.eventos = res; this.aplicarFiltros(); this.cdr.markForCheck(); },
      error: () => this.presentToast('Error al cargar eventos', 'danger')
    });
  }

  aplicarFiltros() {
    let lista = this.eventos;
    if (this.filtroVisibilidad !== 'TODOS') lista = lista.filter(e => e.visibilidad === this.filtroVisibilidad);
    if (this.textoBusqueda.trim()) {
      const texto = this.textoBusqueda.toLowerCase();
      lista = lista.filter(e => e.titulo.toLowerCase().includes(texto) || e.descripcion?.toLowerCase().includes(texto));
    }
    this.eventosFiltrados = lista;
  }

  onSearchChange(event: any) { this.textoBusqueda = event.target.value; this.aplicarFiltros(); }
  cambiarFiltro(tipo: any) { this.filtroVisibilidad = tipo; this.aplicarFiltros(); }

  abrirModal(evento?: Evento) {
    if (evento) { this.esEdicion = true; this.eventoEditando = { ...evento }; }
    else { this.esEdicion = false; this.eventoEditando = { visibilidad: 'PUBLICO', fechaEvento: new Date().toISOString().split('T')[0], horaEvento: '09:00' }; }
    this.modalAbierto = true;
  }

  cerrarModal() { this.modalAbierto = false; this.eventoEditando = {}; }

  guardarEvento() {
    if (!this.eventoEditando.titulo || !this.eventoEditando.fechaEvento) { this.presentToast('Rellena los campos obligatorios', 'warning'); return; }
    this.eventsService.crearEvento(this.eventoEditando as Evento).subscribe({
      next: () => { this.presentToast('Evento guardado', 'success'); this.cerrarModal(); this.cargarEventos(); this.cdr.markForCheck(); },
      error: () => this.presentToast('Error al procesar', 'danger')
    });
  }

  async confirmarBorrado(evento: Evento) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar evento?',
      message: `Vas a eliminar "${evento.titulo}".`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => {
          this.eventsService.eliminarEvento(evento.id!).subscribe({
            next: () => { this.presentToast('Eliminado', 'success'); this.cargarEventos(); this.cdr.markForCheck(); },
            error: (err) => { this.presentToast(`Error al eliminar: ${err.status} ${err.error?.message ?? ''}`, 'danger'); }
          });
        }}
      ]
    });
    await alert.present();
  }

  async presentToast(m: string, c: string) { const t = await this.toastCtrl.create({ message: m, duration: 2000, color: c, position: 'bottom' }); t.present(); }
}