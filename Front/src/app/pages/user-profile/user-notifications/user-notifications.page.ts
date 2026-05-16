import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon, ToastController } from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { firstValueFrom } from 'rxjs';
import { addIcons } from 'ionicons';
import { 
  chatbubblesOutline, calendarOutline, ticketOutline, 
  checkmarkOutline, trashOutline, checkmarkDoneOutline,
  notificationsOffOutline, 
  // Nuevos iconos para invitaciones
  personAddOutline, closeOutline
} from 'ionicons/icons';
import { NotificacionDto } from 'src/app/core/models/models';
import { DiarioService } from 'src/app/services/diario.service';

// Extendemos la interfaz para la UI
interface NotificacionUI {
  id: number;     // ID de la notificación o de la invitación
  titulo: string;
  descripcion: string;
  hora: string;
  tipo: 'mensaje' | 'evento' | 'ticket' | 'invitacion'; 
  icono: string;
  leida: boolean;
  esInvitacion?: boolean; // Flag para saber si es una invitación
}

@Component({
  selector: 'app-user-notifications',
  templateUrl: './user-notifications.page.html',
  styleUrls: ['./user-notifications.page.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserNotificationsPage implements OnInit {
  private http = inject(HttpClient);
  private diarioService = inject(DiarioService);
  private toastCtrl = inject(ToastController);
  private apiUrl = `${environment.apiUrl}/notificaciones`;
  private cdr = inject(ChangeDetectorRef);
  
  notificaciones: NotificacionUI[] = [];

  constructor() {
    addIcons({ 
      chatbubblesOutline, calendarOutline, ticketOutline, 
      checkmarkOutline, trashOutline, checkmarkDoneOutline,
      notificationsOffOutline, personAddOutline, closeOutline
    });
  }

  ngOnInit() {
    this.cargarTodo();
  }

  get conteoNoLeidas(): number {
    return this.notificaciones.filter(n => !n.leida).length;
  }

  async cargarTodo() {
    try {
      // 1. Cargar Notificaciones Normales
      const notifPromise = firstValueFrom(this.http.get<NotificacionDto[]>(this.apiUrl));
      
      // 2. Cargar Invitaciones Pendientes (del DiarioService)
      const invitesPromise = firstValueFrom(this.diarioService.getInvitacionesPendientes());

      // Esperamos a que terminen ambas peticiones
      const [notifsData, invitesData] = await Promise.all([notifPromise, invitesPromise]);
      const notifs = this.normalizarLista<NotificacionDto>(notifsData);
      const invites = this.normalizarLista<any>(invitesData);

      // 3. Procesar Notificaciones normales
      const listaNotifs: NotificacionUI[] = notifs.map(n => this.procesarNotificacion(n));

      // 4. Procesar Invitaciones (Convertirlas al formato visual de notificación)
      const listaInvites: NotificacionUI[] = invites.map(inv => ({
        id: inv.id,
        titulo: 'Invitación a Proyecto',
        descripcion: `${inv.ownerNombre} te invita a colaborar en "${inv.temaTitulo}"`,
        hora: new Date(inv.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tipo: 'invitacion',
        icono: 'person-add-outline',
        leida: false, // Las invitaciones siempre cuentan como "no leídas" hasta que se aceptan
        esInvitacion: true
      }));

      // 5. Unir y Ordenar (Invitaciones primero, luego por estado 'no leída', luego por fecha)
      this.notificaciones = [...listaInvites, ...listaNotifs].sort((a, b) => {
        if (a.tipo === 'invitacion' && b.tipo !== 'invitacion') return -1; // Invitaciones arriba
        if (a.tipo !== 'invitacion' && b.tipo === 'invitacion') return 1;

        // Si son del mismo tipo, priorizar no leídas
        if (a.leida !== b.leida) return a.leida ? 1 : -1;

        return 0;
      });
      this.cdr.markForCheck();

    } catch (error) {
      console.error('Error al cargar datos:', error);
      this.presentToast('No se pudieron cargar las notificaciones', 'danger');
    }
  }

  private procesarNotificacion(n: NotificacionDto): NotificacionUI {
    const textoLower = n.mensaje.toLowerCase();
    let tipo: any = 'mensaje';
    let icono = 'chatbubbles-outline';
    let titulo = 'Mensaje del sistema';

    if (textoLower.includes('ticket') || textoLower.includes('incidencia')) {
      tipo = 'ticket';
      icono = 'ticket-outline';
      titulo = 'Actualización de Soporte';
    } else if (textoLower.includes('evento') || textoLower.includes('reunión')) {
      tipo = 'evento';
      icono = 'calendar-outline';
      titulo = 'Agenda';
    }

    return {
      id: n.id,
      titulo: titulo,
      descripcion: n.mensaje,
      hora: new Date(n.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tipo: tipo,
      icono: icono,
      leida: n.leida,
      esInvitacion: false
    };
  }

  // --- ACCIONES NOTIFICACIONES NORMALES ---

  async marcarLeida(notif: NotificacionUI) {
    if (notif.esInvitacion) return; 
    if (notif.leida) return;
    
    notif.leida = true; // Optimista
    this.cdr.markForCheck();
    try {
      await firstValueFrom(this.http.patch(`${this.apiUrl}/${notif.id}/leer`, {}));
    } catch (error) {
      notif.leida = false; // Revertir si falla
      this.cdr.markForCheck();
    }
  }

  async eliminar(notif: NotificacionUI) {
    if (notif.esInvitacion) return; 
    
    this.notificaciones = this.notificaciones.filter(n => n.id !== notif.id); // Optimista
    this.cdr.markForCheck();
    try {
      await firstValueFrom(this.http.delete(`${this.apiUrl}/${notif.id}`));
    } catch (error) { console.error(error); }
  }

  async marcarTodasLeidas() {
    // Solo marcamos como leídas las que NO son invitaciones
    this.notificaciones.filter(n => !n.esInvitacion).forEach(n => n.leida = true);
    this.cdr.markForCheck();
    try {
      await firstValueFrom(this.http.patch(`${this.apiUrl}/leer-todas`, {}));
    } catch (error) { console.error(error); }
  }

  // --- ACCIONES DE INVITACIÓN (Backend Nuevo) ---

  async responderInvitacion(notif: NotificacionUI, aceptar: boolean) {
    // Quitamos la invitación de la lista inmediatamente (Optimista)
    this.notificaciones = this.notificaciones.filter(n => n.id !== notif.id);
    this.cdr.markForCheck();

    try {
      await firstValueFrom(this.diarioService.responderInvitacion(notif.id, aceptar));
      const msg = aceptar ? '¡Te has unido al proyecto!' : 'Invitación rechazada';
      this.presentToast(msg, aceptar ? 'success' : 'medium');
    } catch (error) {
      console.error('Error al responder invitación', error);
      this.presentToast('Error al procesar la respuesta', 'danger');
      this.cargarTodo(); // Recargar si falló para que vuelva a aparecer
    }
  }

  private async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({ message, duration: 2000, color, position: 'bottom' });
    toast.present();
  }

  private normalizarLista<T>(payload: any): T[] {
    if (Array.isArray(payload)) return payload as T[];
    if (Array.isArray(payload?.content)) return payload.content as T[];
    if (Array.isArray(payload?.data)) return payload.data as T[];
    return [];
  }
}
