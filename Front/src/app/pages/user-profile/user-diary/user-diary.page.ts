import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { IonIcon, ToastController, LoadingController, AlertController, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { MarkdownModule } from 'ngx-markdown';

import {
  addOutline, trashOutline, arrowBackOutline, lockClosedOutline, globeOutline,
  createOutline, chatbubbleEllipsesOutline, sendOutline,
  gitBranchOutline, terminalOutline, codeSlashOutline,
  cloudUploadOutline, libraryOutline, timeOutline, bugOutline,
  calendarOutline, rocketOutline, personAddOutline,
  searchOutline, downloadOutline, eyeOutline, eyeOffOutline,
  bookmarkOutline, bookmarkSharp, flameOutline, filterOutline,
  chevronUpOutline
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
  heatmapData: { date: Date, level: number, count: number }[] = [];

  nuevoTemaTitulo = '';
  nuevoTemaDescripcion = '';
  nuevaEntradaTexto = '';
  nuevaEntradaVisibilidad: Visibilidad = 'PRIVADO';

  notaEditandoId: number | null = null;
  textoEditando = '';
  visibilidadEditando: Visibilidad = 'PRIVADO';

  // Nuevas features
  filtroTipo: 'todo' | 'daily' | 'bug' | 'feature' | 'otro' = 'todo';
  busqueda = '';
  mostrarPreview = false;
  racha = 0;
  pinnedEntradas = new Set<number>();
  mostrarFormCrear = false;

  private readonly themeColors = [
    'linear-gradient(135deg, #7c3aed, #4f46e5)',
    'linear-gradient(135deg, #2563eb, #0891b2)',
    'linear-gradient(135deg, #059669, #0d9488)',
    'linear-gradient(135deg, #d97706, #f59e0b)',
    'linear-gradient(135deg, #dc2626, #e11d48)',
    'linear-gradient(135deg, #7c3aed, #ec4899)',
    'linear-gradient(135deg, #0369a1, #7c3aed)',
    'linear-gradient(135deg, #065f46, #059669)',
  ];

  constructor() {
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
      'person-add-outline': personAddOutline,
      'search-outline': searchOutline,
      'download-outline': downloadOutline,
      'eye-outline': eyeOutline,
      'eye-off-outline': eyeOffOutline,
      'bookmark-outline': bookmarkOutline,
      'bookmark': bookmarkSharp,
      'flame-outline': flameOutline,
      'filter-outline': filterOutline,
      'chevron-up-outline': chevronUpOutline,
    });
  }

  ngOnInit() { this.cargarDatos(); }

  cargarDatos() {
    this.diarioService.getTemas().subscribe(res => { this.temas = res; this.cdr.markForCheck(); });
    this.diarioService.getMisEntradas().subscribe(res => {
      this.entradas = res.content || [];
      this.generarHeatmap();
      this.racha = this.calcularRacha();
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

  getThemeColor(temaId: number): string {
    return this.themeColors[temaId % this.themeColors.length];
  }

  getThemeInitial(titulo: string): string {
    return titulo?.charAt(0).toUpperCase() || '?';
  }

  private calcularRacha(): number {
    let racha = 0;
    const reverse = [...this.heatmapData].reverse();
    for (const dia of reverse) {
      if (dia.count > 0) racha++;
      else break;
    }
    return racha;
  }

  detectTipo(contenido: string): 'daily' | 'bug' | 'feature' | 'otro' {
    if (contenido.includes('Daily Standup') || contenido.includes('📅')) return 'daily';
    if (contenido.includes('Bug Report') || contenido.includes('🐛')) return 'bug';
    if (contenido.includes('Nueva Feature') || contenido.includes('🚀')) return 'feature';
    return 'otro';
  }

  setFiltro(tipo: 'todo' | 'daily' | 'bug' | 'feature' | 'otro') {
    this.filtroTipo = tipo;
    this.cdr.markForCheck();
  }

  togglePreview() {
    this.mostrarPreview = !this.mostrarPreview;
  }

  togglePin(entradaId: number) {
    if (this.pinnedEntradas.has(entradaId)) this.pinnedEntradas.delete(entradaId);
    else this.pinnedEntradas.add(entradaId);
    this.cdr.markForCheck();
  }

  esPinned(entradaId: number): boolean {
    return this.pinnedEntradas.has(entradaId);
  }

  exportarRepo() {
    if (!this.temaSeleccionado) return;
    const entradas = this.entradasFiltradas;
    let md = `# ${this.temaSeleccionado.titulo}\n`;
    if (this.temaSeleccionado.descripcion) md += `> ${this.temaSeleccionado.descripcion}\n`;
    md += `\nExportado el ${new Date().toLocaleDateString('es-ES')}\n\n---\n\n`;
    entradas.forEach((e, i) => {
      const fecha = new Date(e.fechaCreacion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
      md += `## Entrada ${i + 1} — ${fecha}\n*${e.visibilidad}*\n\n${e.contenido}\n\n---\n\n`;
    });
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.temaSeleccionado.titulo.replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  get heatmapWeeks(): { date: Date, level: number, count: number }[][] {
    const weeks: { date: Date, level: number, count: number }[][] = [];
    for (let i = 0; i < this.heatmapData.length; i += 7) {
      weeks.push(this.heatmapData.slice(i, i + 7));
    }
    return weeks;
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
    let resultado = this.entradas.filter(e => e.temaTitulo === this.temaSeleccionado?.titulo);
    if (this.filtroTipo !== 'todo') {
      resultado = resultado.filter(e => this.detectTipo(e.contenido) === this.filtroTipo);
    }
    if (this.busqueda.trim()) {
      const q = this.busqueda.toLowerCase();
      resultado = resultado.filter(e => e.contenido.toLowerCase().includes(q));
    }
    return resultado.sort((a, b) => {
      const aPinned = this.pinnedEntradas.has(a.id) ? 0 : 1;
      const bPinned = this.pinnedEntradas.has(b.id) ? 0 : 1;
      return aPinned - bPinned;
    });
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