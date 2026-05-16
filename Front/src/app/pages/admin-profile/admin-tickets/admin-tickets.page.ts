import { Component, OnInit, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { TicketDto, TicketComentarioDto } from 'src/app/core/models/models';
import { TicketService } from 'src/app/services/ticket.service';
import { addIcons } from 'ionicons';
import {
  searchOutline, chatbubblesOutline, closeOutline, sendOutline,
  personOutline, timeOutline, alertCircleOutline, informationCircleOutline,
  calendarOutline
} from 'ionicons/icons';

import { ScrollingModule } from '@angular/cdk/scrolling';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-admin-tickets',
  templateUrl: './admin-tickets.page.html',
  styleUrls: ['./admin-tickets.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, ScrollingModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminTicketsPage implements OnInit {
  private ticketService = inject(TicketService);
  private toastCtrl = inject(ToastController);
  private breakpointObserver = inject(BreakpointObserver);

  // --- SIGNALS STATE ---
  tickets = signal<TicketDto[]>([]);
  filtroTexto = signal('');
  isMobile = signal(false);

  // Modal & Chat State
  modalAbierto = signal(false);
  ticketEditando = signal<TicketDto | null>(null);
  mensajes = signal<TicketComentarioDto[]>([]);
  nuevoMensaje = signal('');
  modalTab = signal<'chat' | 'info'>('chat');

  // --- COMPUTED SIGNALS ---
  ticketsFiltrados = computed(() => {
    const term = this.filtroTexto().toLowerCase().trim();
    const lista = this.tickets();

    if (!term) return lista;

    return lista.filter(x =>
      x.codigo?.toLowerCase().includes(term) ||
      x.titulo.toLowerCase().includes(term) ||
      x.usuarioNombre?.toLowerCase().includes(term)
    );
  });

  constructor() {
    addIcons({
      searchOutline, chatbubblesOutline, closeOutline, sendOutline,
      personOutline, timeOutline, alertCircleOutline, informationCircleOutline,
      calendarOutline
    });
  }

  ngOnInit() {
    this.cargarTickets();
    this.breakpointObserver.observe('(max-width: 600px)').subscribe(result => {
      this.isMobile.set(result.matches);
    });
  }

  cargarTickets() {
    // Usamos el servicio centralizado (si no existiera getTickets, lo añadimos al servicio)
    // Asumimos que TicketService tiene un método para traer todos los tickets (admin)
    this.ticketService.getTicketsAdmin().subscribe({
      next: (res) => this.tickets.set(res),
      error: () => this.presentToast('Error al cargar tickets', 'danger')
    });
  }

  setFiltro(event: any) {
    this.filtroTexto.set(event.target.value);
  }

  abrirModalEditar(ticket: TicketDto) {
    this.ticketEditando.set({ ...ticket });
    this.modalTab.set('chat');
    this.modalAbierto.set(true);
    this.cargarMensajes(ticket.id);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
    this.ticketEditando.set(null);
    this.mensajes.set([]);
  }

  cargarMensajes(id: number) {
    this.ticketService.getComentarios(id).subscribe({
      next: (res) => this.mensajes.set(res),
      error: () => this.presentToast('Error al cargar chat', 'warning')
    });
  }

  enviarMensaje() {
    const ticket = this.ticketEditando();
    const texto = this.nuevoMensaje().trim();
    
    if (!ticket || !texto) return;

    this.ticketService.enviarComentario(ticket.id, texto).subscribe({
      next: () => {
        this.nuevoMensaje.set('');
        this.cargarMensajes(ticket.id);
      },
      error: () => this.presentToast('Error enviando mensaje', 'danger')
    });
  }

  guardarCambios() {
    const ticket = this.ticketEditando();
    if (!ticket) return;

    // Actualizamos estado/prioridad
    this.ticketService.actualizarTicketAdmin(ticket.id, {
      prioridad: ticket.prioridad,
      estado: ticket.estado
    }).subscribe({
      next: () => {
        this.presentToast('Ticket actualizado', 'success');
        this.cargarTickets(); // Recarga la lista global
        
        // Actualizamos la copia local en el modal sin cerrar
        this.ticketEditando.update(prev => prev ? { ...prev, ...ticket } : null);
      },
      error: () => this.presentToast('Error al guardar cambios', 'danger')
    });
  }

  gestionarReapertura(aceptar: boolean) {
    const ticket = this.ticketEditando();
    if (!ticket) return;

    const nuevoEstado = aceptar ? 'EN_PROGRESO' : 'RESUELTO';
    const mensajeSistema = aceptar
      ? '✅ Solicitud de reapertura aceptada. Un agente revisará el caso.'
      : '⛔ Solicitud de reapertura rechazada. El ticket permanecerá cerrado.';

    // 1. Mensaje auto
    this.ticketService.enviarComentario(ticket.id, mensajeSistema).subscribe(() => {
      // 2. Actualizar estado
      this.ticketService.actualizarTicketAdmin(ticket.id, { estado: nuevoEstado }).subscribe({
        next: () => {
          this.presentToast(aceptar ? 'Reabierto' : 'Rechazado', 'success');
          
          // Actualizar UI Local
          this.ticketEditando.update(t => t ? { ...t, estado: nuevoEstado } : null);
          
          this.cargarTickets();
          this.cargarMensajes(ticket.id);
        },
        error: () => this.presentToast('Error al gestionar solicitud', 'danger')
      });
    });
  }

  async presentToast(m: string, c: string) {
    const t = await this.toastCtrl.create({ message: m, color: c, duration: 2000, position: 'bottom' });
    t.present();
  }
}
