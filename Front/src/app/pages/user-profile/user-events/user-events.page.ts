import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScheduleModule, DayService, WeekService, WorkWeekService, MonthService, AgendaService } from '@syncfusion/ej2-angular-schedule';
import { IonIcon, AlertController, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline, calendarOutline, timeOutline, locationOutline,
  peopleOutline, trashOutline, lockClosedOutline, personOutline,
  calendarNumberOutline
} from 'ionicons/icons';
import { EventsService } from 'src/app/services/events.service';
import { AuthService } from 'src/app/services/auth.service';
import { Evento } from 'src/app/core/models/models';

@Component({
  selector: 'app-user-events',
  templateUrl: './user-events.page.html',
  styleUrls: ['./user-events.page.scss'],
  standalone: true,
  imports: [CommonModule, ScheduleModule, IonIcon],
  providers: [DayService, WeekService, WorkWeekService, MonthService, AgendaService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserEventsPage implements OnInit {
  private eventsService = inject(EventsService);
  private authService = inject(AuthService);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private cdr = inject(ChangeDetectorRef);

  public selectedDate: Date = new Date();
  public eventSettings: any = { dataSource: [] };
  public listaEventos: Evento[] = [];
  public esAdminOStaff = false;

  constructor() {
    addIcons({
      addOutline, calendarOutline, timeOutline, locationOutline,
      peopleOutline, trashOutline, lockClosedOutline, personOutline,
      calendarNumberOutline
    });
  }

  ngOnInit() {
    this.esAdminOStaff = this.authService.isAdmin; 
    this.cargarEventos();
  }

  cargarEventos() {
    this.eventsService.getEventos().subscribe({
      next: (data) => {
        this.listaEventos = data;
        this.mapearCalendario(data);
        this.cdr.markForCheck();
      }
    });
  }

  mapearCalendario(eventos: Evento[]) {
    this.eventSettings = {
      dataSource: eventos.map(ev => {
        const start = new Date(`${ev.fechaEvento}T${ev.horaEvento}`);
        const end = new Date(start.getTime() + 60 * 60 * 1000); 

        return {
          Id: ev.id,
          Subject: ev.titulo,
          StartTime: start,
          EndTime: end,
          Description: ev.descripcion,
          CategoryColor: ev.visibilidad === 'PUBLICO' ? '#3b82f6' : '#a855f7' // Azul para público, Morado para privado
        };
      })
    };
  }

  async abrirNuevoEvento() {
    const inputs: any[] = [
      { name: 'titulo', type: 'text', placeholder: 'Título del evento' },
      { name: 'fecha', type: 'date', min: new Date().toISOString().split('T')[0] },
      { name: 'hora', type: 'time' },
      { name: 'descripcion', type: 'textarea', placeholder: 'Descripción (opcional)' }
    ];

    if (this.esAdminOStaff) {
      inputs.push(
        { name: 'visibilidad', type: 'radio', label: 'Público (Todos lo ven)', value: 'PUBLICO' },
        { name: 'visibilidad', type: 'radio', label: 'Privado (Solo yo)', value: 'PRIVADO', checked: true }
      );
    }

    const alert = await this.alertCtrl.create({
      header: 'Nuevo Evento',
      cssClass: 'custom-alert-premium', // Clase opcional si quieres estilizar alertas
      inputs: inputs,
      buttons: [
        { text: 'Cancelar', role: 'cancel', cssClass: 'alert-cancel-btn' },
        { text: 'Guardar', handler: (data) => this.guardarEvento(data), cssClass: 'alert-confirm-btn' }
      ]
    });
    await alert.present();
  }

  guardarEvento(data: any) {
    if (!data.titulo || !data.fecha || !data.hora) {
      this.mostrarToast('Por favor, rellena título, fecha y hora.', 'warning');
      return;
    }

    const nuevo: Evento = {
      titulo: data.titulo,
      fechaEvento: data.fecha,
      horaEvento: data.hora,
      descripcion: data.descripcion || '',
      visibilidad: data.visibilidad || 'PRIVADO'
    };

    this.eventsService.crearEvento(nuevo).subscribe({
      next: () => {
        this.mostrarToast('Evento creado correctamente', 'success');
        this.cargarEventos();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error:', err);
        this.mostrarToast('No se pudo guardar el evento', 'danger');
        this.cdr.markForCheck();
      }
    });
  }

  eliminarEvento(id: number) {
    this.eventsService.eliminarEvento(id).subscribe({
      next: () => {
        this.mostrarToast('Evento eliminado', 'success');
        this.cargarEventos();
        this.cdr.markForCheck();
      }
    });
  }

  private async mostrarToast(msg: string, color: string = 'dark') {
    const t = await this.toastCtrl.create({ 
      message: msg, 
      duration: 2000, 
      color: color, 
      position: 'bottom',
      mode: 'ios'
    });
    await t.present();
  }
}