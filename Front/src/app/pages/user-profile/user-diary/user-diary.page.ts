import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { IonIcon, ToastController, LoadingController, AlertController, IonSpinner } from '@ionic/angular/standalone';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
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
  chevronUpOutline, cameraOutline, logoMarkdown, sparklesOutline,
  readerOutline, pricetagsOutline, documentTextOutline
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
  escanendoIA = false;

  reviewMap: Record<number, string> = {};
  cargandoReviewIds = new Set<number>();
  etiquetasSugeridas: string[] = [];
  cargandoEtiquetas = false;
  resumenTema: string | null = null;
  cargandoResumen = false;
  mostrarResumen = false;

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
      'camera-outline': cameraOutline,
      'logo-markdown': logoMarkdown,
      'sparkles-outline': sparklesOutline,
      'reader-outline': readerOutline,
      'pricetags-outline': pricetagsOutline,
      'document-text-outline': documentTextOutline,
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

  async exportarRepo() {
    if (!this.temaSeleccionado) return;
    const titulo = this.temaSeleccionado.titulo;
    const alert = await this.alertCtrl.create({
      header: 'Exportar CSV',
      message: `Se exportarán todas las entradas de "${titulo}" como archivo CSV.`,
      cssClass: 'custom-alert',
      buttons: [
        { text: 'Cancelar', role: 'cancel', cssClass: 'alert-button-cancel' },
        {
          text: 'Exportar',
          cssClass: 'alert-button-confirm',
          handler: () => this.ejecutarExportCsv()
        }
      ]
    });
    await alert.present();
  }

  private ejecutarExportCsv() {
    const tema = this.temaSeleccionado!;
    const filename = `${tema.titulo.replace(/\s+/g, '-') || 'diario'}.csv`;
    this.diarioService.exportarTemaCsv(tema.id).subscribe({
      next: (blob) => {
        if (Capacitor.isNativePlatform()) {
          this.exportarNativo(blob, filename, `Exportar ${tema.titulo}`);
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          this.presentToast('Exportación CSV completada', 'success');
        }
      },
      error: () => this.presentToast('No se pudo exportar el CSV', 'danger')
    });
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
      cssClass: 'custom-alert',
      buttons: [
        { text: 'Cancelar', role: 'cancel', cssClass: 'alert-button-cancel' },
        {
          text: 'Eliminar', role: 'destructive', cssClass: 'alert-button-confirm',
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
      cssClass: 'custom-alert',
      buttons: [
        { text: 'No', role: 'cancel', cssClass: 'alert-button-cancel' },
        {
          text: 'Sí', cssClass: 'alert-button-confirm',
          handler: () => this.diarioService.borrarEntrada(id).subscribe(() => { this.cargarDatos(); this.cdr.markForCheck(); })
        }
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

  solicitarCodeReview(entrada: any) {
    if (this.cargandoReviewIds.has(entrada.id)) return;
    if (this.reviewMap[entrada.id]) {
      delete this.reviewMap[entrada.id];
      this.cdr.markForCheck();
      return;
    }
    this.cargandoReviewIds.add(entrada.id);
    this.cdr.markForCheck();

    this.diarioService.codeReview(entrada.id).subscribe({
      next: ({ review }) => {
        this.reviewMap[entrada.id] = review;
        this.cargandoReviewIds.delete(entrada.id);
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargandoReviewIds.delete(entrada.id);
        this.presentToast('No se pudo obtener el code review', 'danger');
        this.cdr.markForCheck();
      }
    });
  }

  sugerirEtiquetas() {
    if (!this.nuevaEntradaTexto.trim() || this.cargandoEtiquetas) return;
    this.cargandoEtiquetas = true;
    this.etiquetasSugeridas = [];
    this.cdr.markForCheck();

    this.diarioService.sugerirEtiquetas(this.nuevaEntradaTexto).subscribe({
      next: ({ etiquetas }) => {
        this.etiquetasSugeridas = etiquetas;
        this.cargandoEtiquetas = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargandoEtiquetas = false;
        this.presentToast('No se pudieron sugerir etiquetas', 'danger');
        this.cdr.markForCheck();
      }
    });
  }

  aplicarEtiqueta(tag: string) {
    const hashtag = `#${tag}`;
    this.nuevaEntradaTexto = this.nuevaEntradaTexto.trim()
      ? `${this.nuevaEntradaTexto}\n${hashtag}`
      : hashtag;
    this.cdr.markForCheck();
  }

  resumirProyecto() {
    if (!this.temaSeleccionado || this.cargandoResumen) return;
    if (this.mostrarResumen && this.resumenTema) {
      this.mostrarResumen = false;
      this.cdr.markForCheck();
      return;
    }
    this.cargandoResumen = true;
    this.mostrarResumen = false;
    this.cdr.markForCheck();

    this.diarioService.resumirTema(this.temaSeleccionado.id).subscribe({
      next: ({ resumen }) => {
        this.resumenTema = resumen;
        this.cargandoResumen = false;
        this.mostrarResumen = true;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargandoResumen = false;
        this.presentToast('No se pudo generar el resumen', 'danger');
        this.cdr.markForCheck();
      }
    });
  }

  exportarMd() {
    const tema = this.temaSeleccionado;
    if (!tema) return;

    const entradas = this.entradasFiltradas;
    const filename = `${tema.titulo.replace(/\s+/g, '-') || 'diario'}.md`;

    const contenido = [
      `# ${tema.titulo}`,
      tema.descripcion ? `\n${tema.descripcion}` : '',
      '',
      ...entradas.map(e => {
        const fecha = new Date(e.fechaCreacion).toLocaleString('es-ES');
        return `---\n\n**${fecha}** · ${e.visibilidad === 'PUBLICO' ? 'Público' : 'Privado'}\n\n${e.contenido ?? ''}\n`;
      })
    ].join('\n');

    const blob = new Blob([contenido], { type: 'text/markdown;charset=utf-8' });

    if (Capacitor.isNativePlatform()) {
      this.exportarNativo(blob, filename, `Exportar ${tema.titulo}`);
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      this.presentToast('Exportación Markdown completada', 'success');
    }
  }

  private exportarNativo(blob: Blob, filename: string, shareTitle: string) {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        await Filesystem.writeFile({ path: filename, data: base64, directory: Directory.Cache });
        const { uri } = await Filesystem.getUri({ path: filename, directory: Directory.Cache });
        try {
          await Share.share({ title: shareTitle, files: [uri], dialogTitle: 'Guardar archivo' });
          this.presentToast('Exportación completada', 'success');
        } catch {
          this.presentToast(`Archivo guardado: ${filename}`, 'success');
        }
      } catch {
        this.presentToast('No se pudo exportar el archivo', 'danger');
      }
    };
    reader.readAsDataURL(blob);
  }

  abrirCamaraIA() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    if (Capacitor.isNativePlatform()) {
      input.setAttribute('capture', 'environment');
    }
    input.style.display = 'none';
    document.body.appendChild(input);
    input.onchange = (event: Event) => {
      if (document.body.contains(input)) document.body.removeChild(input);
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1];
        const mimeType = file.type || 'image/jpeg';
        this.procesarImagenIA(base64, mimeType);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  private procesarImagenIA(imageBase64: string, mimeType: string) {
    this.escanendoIA = true;
    this.cdr.markForCheck();

    this.diarioService.extraerCodigoDeImagen(imageBase64, mimeType).subscribe({
      next: ({ texto }) => {
        this.nuevaEntradaTexto = this.nuevaEntradaTexto
          ? `${this.nuevaEntradaTexto}\n\n\`\`\`\n${texto}\n\`\`\``
          : `\`\`\`\n${texto}\n\`\`\``;
        this.escanendoIA = false;
        this.presentToast('Código extraído correctamente', 'success');
        this.cdr.markForCheck();
      },
      error: () => {
        this.escanendoIA = false;
        this.presentToast('No se pudo procesar la imagen', 'danger');
        this.cdr.markForCheck();
      }
    });
  }

  private async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({ message, duration: 2000, color, position: 'bottom' });
    toast.present();
  }
}
