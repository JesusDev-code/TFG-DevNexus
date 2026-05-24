import { Component, inject, ChangeDetectionStrategy, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { TicketService } from 'src/app/services/ticket.service';
import { AuthService } from 'src/app/services/auth.service';
import { TicketDto, TicketComentarioDto } from 'src/app/core/models/models';
import { addIcons } from 'ionicons';
import {
  addOutline, closeOutline, sendOutline, chatbubblesOutline,
  alertCircleOutline, refreshOutline, timeOutline, checkmarkDoneOutline,
  chevronDownOutline, chevronUpOutline, hourglassOutline,
  menuOutline, searchOutline, filterOutline
} from 'ionicons/icons';

import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-user-tickets',
  templateUrl: './user-tickets.page.html',
  styleUrls: ['./user-tickets.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, ScrollingModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserTicketsPage {
  private ticketService = inject(TicketService);
  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController);
  public authService = inject(AuthService);

  // Estado Reactivo (Signals)
  tickets = signal<TicketDto[]>([]);
  filtroActual = signal<'ABIERTOS' | 'RESUELTOS' | 'TODOS'>('ABIERTOS');
  ticketAbiertoId = signal<number | null>(null);
  
  // Estado UI
  nuevoTicketVisible = signal(false);
  enviando = signal(false);
  mensajes = signal<TicketComentarioDto[]>([]); 

  // Modelos de formulario
  nuevoTitulo = '';
  nuevaDescripcion = '';
  nuevaPrioridad = 'MEDIA';
  nuevoMensajeTexto = '';

  userId: number | null = null;

  // Computed Signal: Memoización automática del filtrado
  ticketsFiltrados = computed(() => {
    const todos = this.tickets();
    const filtro = this.filtroActual();

    if (filtro === 'ABIERTOS') return todos.filter(t => t.estado !== 'RESUELTO');
    if (filtro === 'RESUELTOS') return todos.filter(t => t.estado === 'RESUELTO');
    return todos;
  });

  constructor() {
    addIcons({
      addOutline, closeOutline, sendOutline, chatbubblesOutline,
      alertCircleOutline, refreshOutline, timeOutline, checkmarkDoneOutline,
      chevronDownOutline, chevronUpOutline, hourglassOutline,
      menuOutline, searchOutline, filterOutline
    });

    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.userId = user.id;
        this.cargarTickets();
      }
    });
  }


  cargarTickets() {
    this.ticketService.getMisTickets().subscribe({
      next: (res) => this.tickets.set(res),
      error: (err) => {
        console.error('Error cargando tickets:', err);
        this.presentToast('Error al cargar la lista de tickets', 'danger');
      }
    });
  }

  setFiltro(filtro: 'ABIERTOS' | 'RESUELTOS' | 'TODOS') {
    this.filtroActual.set(filtro);
  }

  toggleNuevoTicket() {
    this.nuevoTicketVisible.update(v => !v);
  }

  crearTicket() {
    if (!this.nuevoTitulo.trim()) {
      this.presentToast('El título es obligatorio', 'warning');
      return;
    }
    if (!this.nuevaDescripcion.trim()) {
      this.presentToast('La descripción es obligatoria', 'warning');
      return;
    }
    if (this.enviando()) return;

    this.enviando.set(true);

    this.ticketService.crearTicket({
      titulo: this.nuevoTitulo,
      descripcion: this.nuevaDescripcion,
      prioridad: this.nuevaPrioridad
    }).subscribe({
      next: () => {
        this.enviando.set(false);
        this.nuevoTicketVisible.set(false);
        this.nuevoTitulo = '';
        this.nuevaDescripcion = '';
        this.cargarTickets();
        this.presentToast('Incidencia registrada con éxito', 'success');
      },
      error: (err) => {
        this.enviando.set(false);
        console.error('Error al crear ticket:', err);
        this.presentToast('No se pudo enviar el ticket', 'danger');
      }
    });
  }

  toggleChat(ticket: TicketDto) {
    this.ticketAbiertoId.update(current => current === ticket.id ? null : ticket.id);
    
    if (this.ticketAbiertoId() === ticket.id) {
      this.cargarMensajes(ticket.id);
    }
  }

  cargarMensajes(ticketId: number) {
    this.ticketService.getComentarios(ticketId).subscribe({
      next: (res) => this.mensajes.set(res),
      error: () => this.presentToast('Error al cargar la conversación', 'warning')
    });
  }

  enviarMensaje() {
    const ticketId = this.ticketAbiertoId();
    if (!this.nuevoMensajeTexto.trim() || !ticketId) return;

    this.ticketService.enviarComentario(ticketId, this.nuevoMensajeTexto).subscribe({
      next: () => {
        this.nuevoMensajeTexto = '';
        this.cargarMensajes(ticketId);
      }
    });
  }

  async solicitarReapertura(ticket: TicketDto) {
    const alert = await this.alertCtrl.create({
      header: '¿Reabrir incidencia?',
      message: 'Indica el motivo por el cual el problema persiste.',
      inputs: [{ name: 'comentario', type: 'textarea', placeholder: 'Detalles aquí...' }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Solicitar',
          handler: (data) => {
            if (!data.comentario) {
              this.presentToast('El motivo es obligatorio', 'warning');
              return false;
            }

            this.ticketService.cambiarEstado(ticket.id, 'SOLICITUD_REAPERTURA', data.comentario).subscribe(() => {
              this.cargarTickets();
              if (this.ticketAbiertoId() === ticket.id) this.cargarMensajes(ticket.id);
              this.presentToast('Solicitud enviada correctamente', 'primary');
            });
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  private async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      color,
      duration: 2500,
      position: 'bottom',
      mode: 'ios'
    });
    toast.present();
  }
}
