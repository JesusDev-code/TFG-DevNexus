import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { IonIcon, ToastController, LoadingController, AlertController, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
// Importamos el módulo de Markdown para que funcione en el HTML
import { MarkdownModule } from 'ngx-markdown';

// Importamos los iconos "Tech" y el nuevo de invitar
import { 
  addOutline, trashOutline, arrowBackOutline, lockClosedOutline, globeOutline, 
  createOutline, chatbubbleEllipsesOutline, sendOutline, 
  // Iconos nuevos:
  gitBranchOutline, terminalOutline, codeSlashOutline, 
  cloudUploadOutline, libraryOutline, timeOutline, bugOutline,
  calendarOutline, rocketOutline, personAddOutline // <--- NUEVO ICONO
} from 'ionicons/icons';

import { DiarioService } from 'src/app/services/diario.service';
import { Visibilidad, DiarioTemaDto } from 'src/app/core/models/models';

@Component({
  selector: 'app-user-diary',
  templateUrl: './user-diary.page.html',
  styleUrls: ['./user-diary.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonIcon, IonSpinner, MarkdownModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDiaryPage implements OnInit {
  private diarioService = inject(DiarioService);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);
  private alertCtrl = inject(AlertController);
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private cdr = inject(ChangeDetectorRef);

  temas: DiarioTemaDto[] = [];
  entradas: any[] = []; 
  temaSeleccionado: DiarioTemaDto | null = null;
  
  // Datos para el Heatmap (Gráfico de actividad)
  heatmapData: { date: Date, level: number, count: number }[] = [];

  nuevoTemaTitulo = '';
  nuevoTemaDescripcion = ''; 
  nuevaEntradaTexto = '';
  nuevaEntradaVisibilidad: Visibilidad = 'PRIVADO';

  notaEditandoId: number | null = null;
  textoEditando = '';
  visibilidadEditando: Visibilidad = 'PRIVADO';

  private themeImages = [
    'assets/avatars/proyecto1.png', 'assets/avatars/proyecto2.png',
    'assets/avatars/proyecto3.png', 'assets/avatars/proyecto4.png',
    'assets/avatars/proyecto5.png', 'assets/avatars/proyecto6.png',
    'assets/avatars/proyecto7.png', 'assets/avatars/proyecto8.png'
  ];

  constructor() {
    // Registramos todos los iconos
    addIcons({ 
      addOutline, trashOutline, arrowBackOutline, lockClosedOutline, globeOutline, 
      createOutline, chatbubbleEllipsesOutline, sendOutline,
      'git-branch-outline': gitBranchOutline,
      'terminal-outline': terminalOutline,
      'code-slash-outline': codeSlashOutline,
      'cloud-upload-outline': cloudUploadOutline,
      'library-outline': libraryOutline,
      'time-outline': timeOutline,
      'bug-outline': bugOutline,
      'calendar-outline': calendarOutline,
      'rocket-outline': rocketOutline,
      'person-add-outline': personAddOutline // <--- REGISTRADO
    });
  }

  ngOnInit() { this.cargarDatos(); }

  cargarDatos() {
    this.diarioService.getTemas().subscribe(res => { this.temas = res; this.cdr.markForCheck(); });
    this.diarioService.getMisEntradas().subscribe(res => {
      this.entradas = res.content || [];
      this.generarHeatmap();
      this.cdr.markForCheck();
    });
  }

  private generarHeatmap() {
    const hoy = new Date();
    const dias = [];
    for (let i = 89; i >= 0; i--) {
      const d = new Date();
      d.setDate(hoy.getDate() - i);
      d.setHours(0,0,0,0);
      
      const count = this.entradas.filter(e => {
        const eDate = new Date(e.fechaCreacion);
        return eDate.getDate() === d.getDate() && 
               eDate.getMonth() === d.getMonth() && 
               eDate.getFullYear() === d.getFullYear();
      }).length;

      let level = 0;
      if (count >= 1) level = 1;
      if (count >= 3) level = 2;
      if (count >= 5) level = 3;

      dias.push({ date: d, level, count });
    }
    this.heatmapData = dias;
  }

  usarPlantilla(tipo: string) {
    let texto = '';
    switch(tipo) {
      case 'daily':
        texto = `### 📅 Daily Standup\n**Ayer:** \n- \n\n**Hoy:** \n- \n\n**Bloqueos:** \n- Ninguno`;
        break;
      case 'bug':
        texto = `### 🐛 Bug Report\n**Error:** \n\n**Solución:** \n\`\`\`javascript\n// Pega tu código aquí\n\`\`\``;
        break;
      case 'feature':
        texto = `### 🚀 Nueva Feature\n**Descripción:** \n\n**Estado:** En progreso`;
        break;
    }
    this.nuevaEntradaTexto = this.nuevaEntradaTexto ? this.nuevaEntradaTexto + '\n\n' + texto : texto;
  }

  getThemeImage(temaId: number): string {
    return this.themeImages[temaId % this.themeImages.length];
  }

  async crearTema() {
    if (!this.nuevoTemaTitulo.trim()) return;
    const loading = await this.loadingCtrl.create({ message: 'Inicializando repositorio...' });
    await loading.present();

    this.diarioService.crearTema({ 
      titulo: this.nuevoTemaTitulo,
      descripcion: this.nuevoTemaDescripcion
    }).subscribe({
      next: () => {
        loading.dismiss();
        this.nuevoTemaTitulo = '';
        this.nuevoTemaDescripcion = '';
        this.cargarDatos();
        this.presentToast('Categoría creada', 'success');
        this.cdr.markForCheck();
      },
      error: () => {
        loading.dismiss();
        this.presentToast('Error al crear', 'danger');
        this.cdr.markForCheck();
      }
    });
  }

  seleccionarTema(tema: DiarioTemaDto) { this.temaSeleccionado = tema; }

  crearEntrada() {
    if (!this.nuevaEntradaTexto.trim() || !this.temaSeleccionado) return;
    this.diarioService.crearEntrada(this.nuevaEntradaTexto, this.temaSeleccionado.id, this.nuevaEntradaVisibilidad).subscribe({
      next: () => {
        this.nuevaEntradaTexto = '';
        this.cargarDatos();
        this.presentToast('Commit guardado', 'success');
        this.cdr.markForCheck();
      },
      error: (err) => {
        // Si el error es 403 (Forbidden), mostramos mensaje personalizado
        if (err.status === 403) {
            this.presentToast('No tienes permiso para escribir en este repo.', 'warning');
        } else {
            this.presentToast('Error al guardar', 'danger');
        }
        this.cdr.markForCheck();
      }
    });
  }

  iniciarEdicion(nota: any) {
    this.notaEditandoId = nota.id;
    this.textoEditando = nota.contenido;
    this.visibilidadEditando = nota.visibilidad as Visibilidad;
  }

  guardarEdicion() {
    if (!this.textoEditando.trim() || !this.notaEditandoId || !this.temaSeleccionado) return;
    this.diarioService.actualizarEntrada(this.notaEditandoId, this.textoEditando, this.visibilidadEditando, this.temaSeleccionado.id).subscribe({
      next: () => {
        this.notaEditandoId = null;
        this.cargarDatos();
        this.presentToast('Nota actualizada', 'success');
        this.cdr.markForCheck();
      },
      error: () => { this.presentToast('Error al actualizar', 'danger'); this.cdr.markForCheck(); }
    });
  }

  cancelarEdicion() { this.notaEditandoId = null; }

  async borrarTema(tema: DiarioTemaDto) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar repositorio?',
      message: `Se borrarán permanentemente todas las notas de "${tema.titulo}".`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Eliminar', role: 'destructive',
          handler: () => this.diarioService.borrarTema(tema.id).subscribe(() => {
            if (this.temaSeleccionado?.id === tema.id) this.temaSeleccionado = null;
            this.cargarDatos();
            this.cdr.markForCheck();
          })
        }
      ]
    });
    await alert.present();
  }

  async borrarEntrada(id: number) {
    const alert = await this.alertCtrl.create({
      header: '¿Borrar entrada?',
      buttons: [
        { text: 'No', role: 'cancel' },
        { text: 'Sí', handler: () => this.diarioService.borrarEntrada(id).subscribe(() => { this.cargarDatos(); this.cdr.markForCheck(); }) }
      ]
    });
    await alert.present();
  }

  toggleComentarios(entrada: any) {
    entrada.mostrarComentarios = !entrada.mostrarComentarios;
    if (entrada.mostrarComentarios && !entrada.listaComentarios) {
      entrada.cargandoComentarios = true;
      this.http.get<any[]>(`${this.apiUrl}/diarios/${entrada.id}/comentarios`).subscribe({
        next: (comentarios) => {
          entrada.listaComentarios = comentarios;
          entrada.cargandoComentarios = false;
          this.cdr.detectChanges();
        },
        error: () => {
          entrada.cargandoComentarios = false;
          this.presentToast('Error cargando comentarios', 'danger');
          this.cdr.detectChanges();
        }
      });
    }
  }

  enviarComentario(entrada: any) {
    if (!entrada.nuevoComentario?.trim()) return;
    const texto = entrada.nuevoComentario;
    entrada.nuevoComentario = ''; 

    this.http.post<any>(`${this.apiUrl}/diarios/${entrada.id}/comentarios`, { texto }).subscribe({
      next: (nuevo) => {
        if (!entrada.listaComentarios) entrada.listaComentarios = [];
        entrada.listaComentarios.push(nuevo);
        this.cdr.detectChanges();
      },
      error: () => {
        entrada.nuevoComentario = texto;
        this.presentToast('Error al enviar comentario', 'danger');
        this.cdr.detectChanges();
      }
    });
  }

  get entradasFiltradas() {
    if (!this.temaSeleccionado) return [];
    return this.entradas.filter(e => e.temaTitulo === this.temaSeleccionado?.titulo);
  }

  volverATemas() { this.temaSeleccionado = null; }

  // ✅ NUEVA FUNCIONALIDAD: INVITAR COLABORADORES
  async abrirInvitacion() {
    if (!this.temaSeleccionado) return;

    const alert = await this.alertCtrl.create({
      header: 'Invitar Dev',
      message: `Escribe el email del usuario para colaborar en "${this.temaSeleccionado.titulo}".`,
      cssClass: 'custom-alert',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'dev@ejemplo.com',
          cssClass: 'alert-input'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel', cssClass: 'alert-button-cancel' },
        {
          text: 'Enviar Invitación',
          cssClass: 'alert-button-confirm',
          handler: (data) => {
            if (data.email) {
              this.enviarInvitacion(data.email);
            } else {
              this.presentToast('Debes escribir un email', 'warning');
              return false;
            }
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  enviarInvitacion(email: string) {
    if (!this.temaSeleccionado) return;
    
    this.diarioService.invitarColaborador(this.temaSeleccionado.id, email).subscribe({
      next: () => this.presentToast(`Invitación enviada a ${email}`, 'success'),
      error: (err) => {
        console.error(err);
        const msg = err.error?.message || 'Error al enviar invitación';
        this.presentToast(msg, 'danger');
      }
    });
  }

  private async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({ message, duration: 2000, color, position: 'bottom' });
    toast.present();
  }
}