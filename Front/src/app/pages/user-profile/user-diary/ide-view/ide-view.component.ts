import {
  Component, Input, Output, EventEmitter, OnInit, OnDestroy,
  ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef,
  inject, HostListener
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { IonIcon, IonSpinner, AlertController, ToastController, ModalController } from '@ionic/angular/standalone';
import { MarkdownModule } from 'ngx-markdown';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline, playOutline, sparklesOutline,
  chevronDownOutline, chevronUpOutline, cloudUploadOutline,
  closeOutline, addOutline, terminalOutline, codeSlashOutline,
  gitCommitOutline, timeOutline, cameraOutline, pricetagsOutline,
  readerOutline, saveOutline, closeCircleOutline, trashOutline, personAddOutline, funnelOutline,
  folderOpenOutline, ellipsisHorizontalOutline, chatbubbleOutline, sendOutline
} from 'ionicons/icons';
import { ColaboradorDto, DiarioComentario, DiarioDto, DiarioTemaDto, ProyectoAnalisisDto } from 'src/app/core/models/models';
import { DiarioService } from 'src/app/services/diario.service';
import { FileTreeComponent } from '../file-tree/file-tree.component';
import { SandboxPreviewComponent } from '../sandbox-preview/sandbox-preview.component';

declare const require: any;

@Component({
  selector: 'app-ide-view',
  standalone: true,
  imports: [CommonModule, FormsModule, IonIcon, IonSpinner, MarkdownModule, FileTreeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ide-view.component.html',
  styleUrls: ['./ide-view.component.scss']
})
export class IdeViewComponent implements OnInit, OnDestroy {
  @Input() tema!: DiarioTemaDto;
  @Input() readOnly = false;
  @Input() staffFeedbackMode = false;
  @Input() overrideCommits: DiarioDto[] | null = null;
  @Output() volver = new EventEmitter<void>();
  @Output() irAMensajes = new EventEmitter<{ userId: number; nombre: string }>();

  @ViewChild('editorContainer', { static: false }) editorContainerRef!: ElementRef;

  private diarioService = inject(DiarioService);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private modalCtrl = inject(ModalController);
  private cdr = inject(ChangeDetectorRef);

  archivos: DiarioDto[] = [];
  archivoActivo: DiarioDto | null = null;
  contenidoEditor = '';
  tienesCambios = false;

  commitLog: DiarioDto[] = [];
  panelInferior: 'none' | 'commits' | 'feedback' = 'none';
  nuevoCommitTexto = '';
  feedbackCommitId: number | null = null;

  mostrarAIPanel = false;
  cargandoAI = false;
  analisisAI: ProyectoAnalisisDto | null = null;
  sintaxisErrores: string[] = [];
  sintaxisWarnings: string[] = [];
  cargandoVision = false;
  cargandoCodeReview = false;
  codeReviewActual: string | null = null;
  cargandoEtiquetas = false;
  etiquetasSugeridas: string[] = [];
  cargandoResumen = false;
  resumenTema: string | null = null;

  mostrarFileTree = true;
  mostrarFiltroEtiquetas = false;
  filtroEtiquetasActivas: string[] = [];
  etiquetasCommitActuales: string[] = [];
  etiquetasSugeridosCommit: string[] = [];

  commitFeedbackMap: Record<number, { loading: boolean; comments: DiarioComentario[]; text: string }> = {};

  temaFeedbackComments: DiarioComentario[] = [];
  temaFeedbackLoading = false;
  temaFeedbackText = '';

  colaboradores: ColaboradorDto[] = [];
  mostrarCollabPanel = false;

  guardando = false;
  cargando = true;
  exportando = false;
  modoCompatArchivos = false;
  carpetasManual: string[] = [];

  private editor: any = null;
  private monacoLoaded = false;

  get permiteGestionCommits(): boolean {
    return !this.readOnly && !this.staffFeedbackMode;
  }

  get feedbackStateSeleccionado() {
    if (this.feedbackCommitId === null) return null;
    return this.commitFeedbackMap[this.feedbackCommitId] ?? null;
  }

  constructor() {
    addIcons({
      'arrow-back-outline': arrowBackOutline,
      'play-outline': playOutline,
      'sparkles-outline': sparklesOutline,
      'chevron-down-outline': chevronDownOutline,
      'chevron-up-outline': chevronUpOutline,
      'cloud-upload-outline': cloudUploadOutline,
      'close-outline': closeOutline,
      'add-outline': addOutline,
      'terminal-outline': terminalOutline,
      'code-slash-outline': codeSlashOutline,
      'git-commit-outline': gitCommitOutline,
      'time-outline': timeOutline,
      'camera-outline': cameraOutline,
      'pricetags-outline': pricetagsOutline,
      'reader-outline': readerOutline,
      'save-outline': saveOutline,
      'close-circle-outline': closeCircleOutline,
      'trash-outline': trashOutline,
      'person-add-outline': personAddOutline,
      'funnel-outline': funnelOutline,
      'folder-open-outline': folderOpenOutline,
      'ellipsis-horizontal-outline': ellipsisHorizontalOutline,
      'chatbubble-outline': chatbubbleOutline,
      'send-outline': sendOutline,
    });
  }

  ngOnInit() {
    this.cargarCarpetasManual();
    this.cargarArchivos();
    this.cargarCommitLog();
    this.cargarColaboradores();
    if (this.readOnly || this.staffFeedbackMode) {
      this.panelInferior = 'feedback';
    }
    this.cargarFeedbackTema();
  }

  ngOnDestroy() {
    this.editor?.dispose();
  }

  cargarColaboradores() {
    this.diarioService.getColaboradores(this.tema.id).subscribe({
      next: (res) => { this.colaboradores = res; this.cdr.markForCheck(); },
      error: () => {}
    });
  }

  cargarArchivos() {
    this.cargando = true;
    this.diarioService.getArchivosActuales(this.tema.id).subscribe({
      next: (archivosRaw) => {
        this.modoCompatArchivos = false;
        console.log('[IDE] Archivos cargados (raw):', archivosRaw.map(a => ({
          id: a.id,
          filename: a.filename,
          tipo: a.tipo
        })));
        
        const archivos = this.normalizarArchivos(archivosRaw);
        console.log('[IDE] Archivos después de normalizar:', archivos.map(a => ({
          id: a.id,
          filename: a.filename,
          tipo: a.tipo
        })));
        
        this.archivos = archivos;
        if (this.archivos.length > 0) {
          const preferido = this.archivoActivo
            ? this.archivos.find(a => a.filename === this.archivoActivo?.filename) ?? this.archivos[0]
            : this.archivos[0];
          this.seleccionarArchivo(preferido);
        } else {
          this.archivoActivo = null;
          this.contenidoEditor = '';
        }
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: () => this.cargarArchivosCompat()
    });
  }

  private cargarArchivosCompat() {
    this.diarioService.getMisEntradas().subscribe({
      next: (res: any) => {
        const entradas = (res?.content ?? []) as DiarioDto[];
        const delTema = entradas.filter(e => e.temaTitulo === this.tema.titulo);
        const candidatos = delTema.filter(e => this.esEntradaArchivo(e));

        const latestByFilename = new Map<string, DiarioDto>();
        const ordenados = [...candidatos].sort(
          (a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
        );

        for (const entrada of ordenados) {
          const filename = this.resolverNombreArchivo(entrada, latestByFilename.size + 1);
          if (!latestByFilename.has(filename)) {
            latestByFilename.set(filename, { ...entrada, tipo: 'FILE', filename });
          }
        }

        this.archivos = Array.from(latestByFilename.values()).sort((a, b) =>
          (a.filename ?? '').localeCompare(b.filename ?? '')
        );
        this.modoCompatArchivos = true;
        this.cargando = false;

        if (this.archivos.length > 0) {
          const preferido = this.archivoActivo
            ? this.archivos.find(a => a.filename === this.archivoActivo?.filename) ?? this.archivos[0]
            : this.archivos[0];
          this.seleccionarArchivo(preferido);
          this.mostrarToast('Modo compatibilidad activado: usando entradas del diario como archivos', 'warning');
        } else {
          this.archivoActivo = null;
          this.contenidoEditor = '';
        }

        this.cdr.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.cargando = false;
        this.archivoActivo = null;
        this.contenidoEditor = '';
        this.mostrarToast(this.getApiErrorMessage(error, 'No se pudieron cargar los archivos del proyecto'), 'danger');
        this.cdr.markForCheck();
      }
    });
  }

  private asegurarFeedbackState(commitId: number) {
    if (!this.commitFeedbackMap[commitId]) {
      this.commitFeedbackMap[commitId] = { loading: false, comments: [], text: '' };
    }
    return this.commitFeedbackMap[commitId];
  }

  private cargarFeedbackCommit(commitId: number) {
    const state = this.asegurarFeedbackState(commitId);
    if (state.loading) return;

    state.loading = true;
    this.diarioService.getComentarios(commitId).subscribe({
      next: (coms) => {
        state.comments = coms;
        state.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        state.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private sincronizarFeedbackSeleccionado() {
    if (!this.commitLog.length) {
      this.feedbackCommitId = null;
      return;
    }

    const existeSeleccion =
      this.feedbackCommitId !== null &&
      this.commitLog.some(c => c.id === this.feedbackCommitId);

    if (!existeSeleccion) {
      this.feedbackCommitId = this.commitLog[0].id;
    }

    if (this.feedbackCommitId !== null) {
      const state = this.asegurarFeedbackState(this.feedbackCommitId);
      if (!state.comments.length && !state.loading) {
        this.cargarFeedbackCommit(this.feedbackCommitId);
      }
    }
  }

  toggleCommitLogPanel() {
    this.panelInferior = this.panelInferior === 'commits' ? 'none' : 'commits';
    this.cdr.markForCheck();
  }

  toggleFeedbackPanel() {
    const cerrando = this.panelInferior === 'feedback';
    this.panelInferior = cerrando ? 'none' : 'feedback';
    if (!cerrando) {
      this.cargarFeedbackTema();
    }
    this.cdr.markForCheck();
  }

  cargarFeedbackTema() {
    if (this.temaFeedbackLoading) return;
    this.temaFeedbackLoading = true;
    this.cdr.markForCheck();
    this.diarioService.getComentariosTema(this.tema.id).subscribe({
      next: (coms) => {
        this.temaFeedbackComments = coms;
        this.temaFeedbackLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.temaFeedbackLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  enviarFeedbackTema() {
    if (!this.temaFeedbackText.trim()) return;
    const texto = this.temaFeedbackText;
    this.temaFeedbackText = '';
    this.diarioService.agregarComentarioTema(this.tema.id, texto).subscribe({
      next: (nuevo) => {
        this.temaFeedbackComments = [...this.temaFeedbackComments, nuevo];
        this.cdr.markForCheck();
      },
      error: () => {
        this.temaFeedbackText = texto;
        this.mostrarToast('Error al enviar el mensaje', 'danger');
        this.cdr.markForCheck();
      }
    });
  }

  cerrarPanelInferior() {
    this.panelInferior = 'none';
    this.cdr.markForCheck();
  }

  seleccionarCommitFeedback(commitId: number) {
    const selectedId = Number(commitId);
    if (!Number.isFinite(selectedId) || selectedId <= 0) return;
    this.feedbackCommitId = selectedId;
    this.cargarFeedbackCommit(selectedId);
    this.cdr.markForCheck();
  }

  getFeedbackText(): string {
    if (this.feedbackCommitId === null) return '';
    return this.asegurarFeedbackState(this.feedbackCommitId).text;
  }

  setFeedbackText(value: string) {
    if (this.feedbackCommitId === null) return;
    this.asegurarFeedbackState(this.feedbackCommitId).text = value ?? '';
  }

  getEtiquetaFeedback(entrada: DiarioDto): string {
    if (entrada.tipo === 'FILE') {
      return `Archivo: ${entrada.filename || 'sin nombre'}`;
    }
    const texto = (entrada.contenido || 'Commit').replace(/\s+/g, ' ').trim();
    return texto.length > 80 ? `${texto.slice(0, 80)}...` : texto;
  }

  enviarFeedbackCommitSeleccionado() {
    if (this.feedbackCommitId === null) return;
    const state = this.asegurarFeedbackState(this.feedbackCommitId);
    if (!state.text.trim()) return;

    const texto = state.text;
    state.text = '';
    this.diarioService.agregarComentario(this.feedbackCommitId, texto).subscribe({
      next: (nuevo) => {
        state.comments = [...state.comments, nuevo];
        this.cdr.markForCheck();
      },
      error: () => {
        state.text = texto;
        this.mostrarToast('Error al enviar feedback', 'danger');
        this.cdr.markForCheck();
      }
    });
  }

  cargarCommitLog() {
    if (this.overrideCommits !== null) {
      this.commitLog = [...this.overrideCommits];
      this.sincronizarFeedbackSeleccionado();
      this.cdr.markForCheck();
      return;
    }
    this.diarioService.getMisEntradas().subscribe({
      next: (res: any) => {
        const entradas = (res?.content ?? []) as DiarioDto[];
        this.commitLog = entradas
          .filter(e => e.temaTitulo === this.tema.titulo && !this.esEntradaArchivo(e))
          .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
          .slice(0, 100);
        this.sincronizarFeedbackSeleccionado();
        this.cdr.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.mostrarToast(this.getApiErrorMessage(error, 'No se pudo cargar el historial de commits'), 'warning');
      }
    });
  }

  seleccionarArchivo(archivo: DiarioDto) {
    if (this.tienesCambios) {
      this.mostrarToast('Tienes cambios sin guardar en el archivo actual', 'warning');
    }
    this.archivoActivo = archivo;
    this.contenidoEditor = archivo.contenido ?? '';
    this.tienesCambios = false;

    if (this.editor) {
      const model = (window as any).monaco?.editor.createModel(
        this.contenidoEditor,
        this.getLenguaje(archivo.filename ?? '')
      );
      this.editor.setModel(model);
    } else {
      this.initMonaco();
    }
    this.cdr.markForCheck();
  }

  onEditorChange(value: string) {
    this.tienesCambios = value !== (this.archivoActivo?.contenido ?? '');
    this.contenidoEditor = value;

    // Mantener buffer local por archivo para que Run use cambios no guardados
    if (this.archivoActivo) {
      const activoId = this.archivoActivo.id;
      const activoFilename = this.archivoActivo.filename ?? '';
      this.archivos = this.archivos.map(a =>
        (activoId != null && a.id === activoId) || ((activoId == null) && (a.filename ?? '') === activoFilename)
          ? { ...a, contenido: value }
          : a
      );
    }
  }

  guardarArchivo() {
    if (this.readOnly) return;
    if (!this.archivoActivo || !this.tienesCambios || this.guardando) return;
    if (!this.archivoActivo.id) {
      this.mostrarToast('Error: el archivo no tiene ID para actualizar', 'danger');
      return;
    }
    this.guardando = true;
    this.cdr.markForCheck();

    this.diarioService.actualizarEntrada(
      this.archivoActivo.id,
      this.contenidoEditor,
      'PRIVADO',
      this.tema.id
    ).subscribe({
      next: () => {
        this.tienesCambios = false;
        this.guardando = false;
        if (this.archivoActivo) {
          this.archivoActivo = { ...this.archivoActivo, contenido: this.contenidoEditor };
          this.archivos = this.archivos.map(a =>
            a.id === this.archivoActivo!.id
              ? { ...a, contenido: this.contenidoEditor }
              : a
          );
        }
        this.mostrarToast('Archivo guardado', 'success');
        this.cdr.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.guardando = false;
        this.mostrarToast(this.getApiErrorMessage(error, 'Error al guardar el archivo'), 'danger');
        this.cdr.markForCheck();
      }
    });
  }

  async crearNuevoArchivo(carpetaBase?: string) {
    if (this.readOnly) return;
    const carpetaPrefijada = this.normalizarRutaCarpeta(carpetaBase ?? '');
    const alert = await this.alertCtrl.create({
      header: carpetaPrefijada ? `Nuevo archivo en ${carpetaPrefijada}` : 'Nuevo archivo',
      cssClass: 'custom-alert',
      inputs: [
        {
          name: 'filename',
          type: 'text',
          placeholder: carpetaPrefijada ? 'main.ts o utils/helper.ts' : 'src/main.ts, backend/app.py, index.html...',
          cssClass: 'alert-input'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel', cssClass: 'alert-button-cancel', handler: () => {} },
        {
          text: 'Crear',
          cssClass: 'alert-button-confirm',
          handler: (data) => {
            const name = this.resolverNombreArchivoNuevo((data.filename ?? '').trim(), carpetaPrefijada);
            if (!name) return false;
            this.crearArchivo(name);
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  private resolverNombreArchivoNuevo(raw: string, carpetaBase: string): string {
    const normalizado = this.normalizarRutaArchivo(raw);
    if (!normalizado) return '';
    if (!carpetaBase) return normalizado;
    let relativo = normalizado;
    if (relativo.startsWith(`${carpetaBase}/`)) {
      relativo = relativo.slice(carpetaBase.length + 1);
    }
    if (!relativo) return '';
    return `${carpetaBase}/${relativo}`;
  }

  async crearCarpeta(carpetaBase?: string) {
    const base = this.normalizarRutaCarpeta(carpetaBase ?? '');
    const alert = await this.alertCtrl.create({
      header: base ? `Nueva subcarpeta en ${base}` : 'Nueva carpeta',
      cssClass: 'custom-alert',
      inputs: [
        {
          name: 'folder',
          type: 'text',
          placeholder: base ? 'nombre-subcarpeta o sub/ruta' : 'src/components o backend/services',
          cssClass: 'alert-input'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel', cssClass: 'alert-button-cancel', handler: () => {} },
        {
          text: 'Crear',
          cssClass: 'alert-button-confirm',
          handler: (data) => {
            const folder = this.resolverNombreCarpetaNueva((data.folder ?? '').trim(), base);
            if (!folder) return false;
            if (this.carpetasManual.includes(folder)) {
              this.mostrarToast('La carpeta ya existe', 'warning');
              return false;
            }
            this.carpetasManual = [...this.carpetasManual, folder].sort((a, b) => a.localeCompare(b));
            this.guardarCarpetasManual();
            this.mostrarToast(`Carpeta "${folder}" creada`, 'success');
            this.cdr.markForCheck();
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  private resolverNombreCarpetaNueva(raw: string, carpetaBase: string): string {
    const normalizada = this.normalizarRutaCarpeta(raw);
    if (!normalizada) return '';
    if (!carpetaBase) return normalizada;
    let relativa = normalizada;
    if (relativa.startsWith(`${carpetaBase}/`)) {
      relativa = relativa.slice(carpetaBase.length + 1);
    }
    if (!relativa) return '';
    return `${carpetaBase}/${relativa}`;
  }

  async editarCarpeta(rutaActual: string) {
    const original = this.normalizarRutaCarpeta(rutaActual);
    if (!original) return;

    if (this.carpetaTieneArchivos(original)) {
      this.mostrarToast('No se puede renombrar una carpeta que contiene archivos', 'warning');
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Renombrar carpeta',
      cssClass: 'custom-alert',
      inputs: [
        {
          name: 'folder',
          type: 'text',
          value: original,
          placeholder: 'Nuevo nombre de carpeta',
          cssClass: 'alert-input'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel', cssClass: 'alert-button-cancel', handler: () => {} },
        {
          text: 'Guardar',
          cssClass: 'alert-button-confirm',
          handler: (data) => {
            const nueva = this.normalizarRutaCarpeta(data.folder ?? '');
            if (!nueva) return false;
            if (nueva === original) return true;
            if (this.carpetasManual.includes(nueva)) {
              this.mostrarToast('Ya existe una carpeta con ese nombre', 'warning');
              return false;
            }
            this.carpetasManual = this.carpetasManual
              .map(c => c === original ? nueva : c)
              .sort((a, b) => a.localeCompare(b));
            this.guardarCarpetasManual();
            this.mostrarToast(`Carpeta renombrada a "${nueva}"`, 'success');
            this.cdr.markForCheck();
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async borrarCarpeta(ruta: string) {
    const folder = this.normalizarRutaCarpeta(ruta);
    if (!folder) return;

    if (this.carpetaTieneArchivos(folder)) {
      this.mostrarToast('No se puede eliminar: la carpeta contiene archivos', 'warning');
      return;
    }

    const alert = await this.alertCtrl.create({
      header: `¿Eliminar carpeta "${folder}"?`,
      message: 'Se eliminará del árbol del proyecto.',
      cssClass: 'custom-alert',
      buttons: [
        { text: 'Cancelar', role: 'cancel', cssClass: 'alert-button-cancel', handler: () => {} },
        {
          text: 'Eliminar',
          cssClass: 'alert-button-confirm',
          handler: () => {
            this.carpetasManual = this.carpetasManual.filter(c => c !== folder);
            this.guardarCarpetasManual();
            this.mostrarToast('Carpeta eliminada', 'success');
            this.cdr.markForCheck();
          }
        }
      ]
    });
    await alert.present();
  }

  private crearArchivo(filename: string) {
    const contenidoDefault = this.getDefaultContent(filename);
    const rutaCompleta = this.normalizarRutaArchivo(filename);
    
    console.log('[IDE] Creando archivo:', { filename, rutaCompleta, contenidoDefault: contenidoDefault.substring(0, 50) + '...' });
    
    this.diarioService.crearArchivoIDE(this.tema.id, rutaCompleta, contenidoDefault).subscribe({
      next: (nuevo) => {
        console.log('[IDE] Respuesta del backend:', { 
          id: nuevo.id, 
          filename: nuevo.filename, 
          tipo: nuevo.tipo,
          contenidoLength: nuevo.contenido?.length 
        });
        
        // CRÍTICO: El backend debe devolver el filename completo
        // Si no lo devuelve, forzamos el que enviamos
        const filenameUsado = nuevo.filename?.trim() || rutaCompleta;
        console.log('[IDE] Filename usado:', { backend: nuevo.filename, rutaCompleta, final: filenameUsado });
        
        const nuevoConNombre: DiarioDto = {
          ...nuevo,
          tipo: 'FILE',
          filename: filenameUsado,
          contenido: contenidoDefault
        };
        
        // Agregar a la lista local INMEDIATAMENTE
        const filenameNormalizado = nuevoConNombre.filename ?? '';
        const existe = this.archivos.some(a => (a.filename ?? '') === filenameNormalizado);
        if (existe) {
          this.archivos = this.archivos.map(a =>
            (a.filename ?? '') === filenameNormalizado ? { ...a, ...nuevoConNombre } : a
          );
        } else {
          this.archivos = [...this.archivos, nuevoConNombre];
        }
        
        // Guardar las carpetas DESPUÉS de que el archivo existe localmente
        this.garantizarCarpetasDelArchivo(filenameUsado);
        
        this.seleccionarArchivo(nuevoConNombre);
        this.mostrarToast(`${filename} creado`, 'success');
        this.cdr.markForCheck();
      },
      error: (error: HttpErrorResponse) =>
        this.mostrarToast(this.getApiErrorMessage(error, 'Error al crear el archivo'), 'danger')
    });
  }

  private garantizarCarpetasDelArchivo(rutaCompleta: string) {
    const normalizada = this.normalizarRutaArchivo(rutaCompleta);
    const partes = normalizada.split('/').filter(Boolean);
    
    // Remover el último (que es el nombre del archivo)
    if (partes.length > 1) {
      const carpetas: string[] = [];
      for (let i = 0; i < partes.length - 1; i++) {
        const ruta = partes.slice(0, i + 1).join('/');
        carpetas.push(ruta);
      }
      
      // Agregar todas las carpetas a carpetasManual si no están
      let cambios = false;
      for (const carpeta of carpetas) {
        if (!this.carpetasManual.includes(carpeta)) {
          this.carpetasManual = [...this.carpetasManual, carpeta].sort((a, b) => a.localeCompare(b));
          cambios = true;
        }
      }
      
      if (cambios) {
        this.guardarCarpetasManual();
        console.log('[IDE] Carpetas guardadas:', this.carpetasManual);
      }
    }
  }

  async borrarArchivo(archivo: DiarioDto) {
    if (this.readOnly) return;
    const alert = await this.alertCtrl.create({
      header: `¿Eliminar ${archivo.filename}?`,
      message: 'Se eliminará el historial completo del archivo.',
      cssClass: 'custom-alert',
      buttons: [
        { text: 'Cancelar', role: 'cancel', cssClass: 'alert-button-cancel', handler: () => {} },
        {
          text: 'Eliminar', cssClass: 'alert-button-confirm',
          handler: () => {
            this.diarioService.borrarEntrada(archivo.id).subscribe({
              next: () => {
                this.archivos = this.archivos.filter(a => a.filename !== archivo.filename);
                if (this.archivoActivo?.filename === archivo.filename) {
                  this.archivoActivo = this.archivos[0] ?? null;
                  if (this.archivoActivo) this.seleccionarArchivo(this.archivoActivo);
                  else this.editor?.setValue('');
                }
                this.mostrarToast(`${archivo.filename} eliminado`, 'success');
                this.cargarArchivos();
                this.cdr.markForCheck();
              },
              error: (error: HttpErrorResponse) =>
                this.mostrarToast(this.getApiErrorMessage(error, 'Error al eliminar'), 'danger')
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async ejecutarProyecto() {
    const archivosParaPreview = this.archivos.map(a => {
      if (this.archivoActivo && a.id === this.archivoActivo.id) {
        return { ...a, contenido: this.contenidoEditor };
      }
      return a;
    });

    const modal = await this.modalCtrl.create({
      component: SandboxPreviewComponent,
      componentProps: {
        archivos: archivosParaPreview,
        archivoActivoId: this.archivoActivo?.id,
        archivoActivoFilename: this.archivoActivo?.filename,
        nombreProyecto: this.tema.titulo
      },
      cssClass: 'fullscreen-modal'
    });
    await modal.present();
  }

  analizarConIA() {
    if (this.cargandoAI) return;
    this.cargandoAI = true;
    this.mostrarAIPanel = true;
    this.cdr.markForCheck();

    this.diarioService.analizarProyecto(this.tema.id).subscribe({
      next: (analisis) => {
        this.analisisAI = analisis;
        this.cargandoAI = false;
        this.cdr.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.cargandoAI = false;
        this.mostrarToast(this.getApiErrorMessage(error, 'No se pudo analizar el proyecto'), 'danger');
        this.cdr.markForCheck();
      }
    });
  }

  toggleCollabPanel() {
    this.mostrarCollabPanel = !this.mostrarCollabPanel;
    this.cdr.markForCheck();
  }

  abrirMenuIA() {
    this.mostrarAIPanel = !this.mostrarAIPanel;
    this.cdr.markForCheck();
  }

  descartarCambios() {
    if (!this.archivoActivo || !this.tienesCambios) return;
    const contenidoPersistido = this.archivoActivo.contenido ?? '';
    this.contenidoEditor = contenidoPersistido;
    if (this.editor) {
      this.editor.setValue(contenidoPersistido);
    }
    this.tienesCambios = false;
    this.mostrarToast('Cambios descartados', 'warning');
    this.cdr.markForCheck();
  }

  async borrarCommit(commit: DiarioDto) {
    if (!this.permiteGestionCommits) return;
    const preview = (commit.contenido ?? '').slice(0, 80);
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar commit?',
      message: preview ? `Se eliminará: "${preview}${commit.contenido!.length > 80 ? '…' : ''}"` : 'Esta acción no se puede deshacer.',
      cssClass: 'custom-alert',
      buttons: [
        { text: 'Cancelar', role: 'cancel', cssClass: 'alert-button-cancel' },
        {
          text: 'Eliminar',
          cssClass: 'alert-button-confirm',
          handler: () => {
            this.diarioService.borrarEntrada(commit.id).subscribe({
              next: () => {
                this.commitLog = this.commitLog.filter(c => c.id !== commit.id);
                delete this.commitFeedbackMap[commit.id];
                this.sincronizarFeedbackSeleccionado();
                this.mostrarToast('Commit eliminado', 'success');
                this.cdr.markForCheck();
              },
              error: (error: HttpErrorResponse) =>
                this.mostrarToast(this.getApiErrorMessage(error, 'No se pudo eliminar el commit'), 'danger')
            });
          }
        }
      ]
    });
    await alert.present();
  }

  solicitarCodeReviewArchivo() {
    if (!this.archivoActivo?.id) {
      this.mostrarToast('No hay archivo activo para revisar', 'warning');
      return;
    }
    if (this.tienesCambios) {
      this.mostrarToast('Guarda el archivo para revisar la última versión', 'warning');
      return;
    }
    this.cargandoCodeReview = true;
    this.codeReviewActual = null;
    this.cdr.markForCheck();
    this.diarioService.codeReview(this.archivoActivo.id).subscribe({
      next: ({ review }) => {
        this.codeReviewActual = review;
        this.cargandoCodeReview = false;
        this.mostrarAIPanel = true;
        this.cdr.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.cargandoCodeReview = false;
        this.mostrarToast(this.getApiErrorMessage(error, 'No se pudo generar el code review'), 'danger');
        this.cdr.markForCheck();
      }
    });
  }

  sugerirEtiquetasCommit() {
    if (!this.permiteGestionCommits) return;
    if (!this.nuevoCommitTexto.trim() || this.cargandoEtiquetas) {
      this.mostrarToast('Escribe texto en el commit para sugerir etiquetas', 'warning');
      return;
    }
    this.cargandoEtiquetas = true;
    this.etiquetasSugeridosCommit = [];
    this.cdr.markForCheck();
    this.diarioService.sugerirEtiquetas(this.nuevoCommitTexto).subscribe({
      next: ({ etiquetas }) => {
        this.etiquetasSugeridosCommit = etiquetas ?? [];
        this.cargandoEtiquetas = false;
        this.cdr.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.cargandoEtiquetas = false;
        this.mostrarToast(this.getApiErrorMessage(error, 'No se pudieron sugerir etiquetas'), 'danger');
        this.cdr.markForCheck();
      }
    });
  }

  aplicarEtiqueta(tag: string) {
    if (!this.permiteGestionCommits) return;
    const hashtag = `#${tag}`;
    this.nuevoCommitTexto = this.nuevoCommitTexto.trim()
      ? `${this.nuevoCommitTexto} ${hashtag}`
      : hashtag;
    this.etiquetasSugeridosCommit = this.etiquetasSugeridosCommit.filter(t => t !== tag);
    this.cdr.markForCheck();
  }

  aplicarFiltroEtiqueta(tag: string) {
    const idx = this.filtroEtiquetasActivas.indexOf(tag);
    if (idx >= 0) {
      this.filtroEtiquetasActivas.splice(idx, 1);
    } else {
      this.filtroEtiquetasActivas.push(tag);
    }
    this.cdr.markForCheck();
  }

  extraerEtiquetas(commit: DiarioDto): string[] {
    const contenido = commit.contenido ?? '';
    const regex = /#(\w+)/g;
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(contenido)) !== null) {
      matches.push(match[1]);
    }
    return [...new Set(matches)];
  }

  tieneEtiquetasCompatibles(commit: DiarioDto): boolean {
    if (!this.filtroEtiquetasActivas.length) return true;
    const etiquetasDelCommit = this.extraerEtiquetas(commit);
    return this.filtroEtiquetasActivas.some(tag => etiquetasDelCommit.includes(tag));
  }

  resumirProyecto() {
    if (this.cargandoResumen) return;
    this.cargandoResumen = true;
    this.resumenTema = null;
    this.cdr.markForCheck();
    this.diarioService.resumirTema(this.tema.id).subscribe({
      next: ({ resumen }) => {
        this.resumenTema = resumen;
        this.cargandoResumen = false;
        this.mostrarAIPanel = true;
        this.cdr.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.cargandoResumen = false;
        this.mostrarToast(this.getApiErrorMessage(error, 'No se pudo generar el resumen del proyecto'), 'danger');
        this.cdr.markForCheck();
      }
    });
  }

  analizarSintaxisArchivoActual() {
    if (!this.editor || !this.archivoActivo) {
      this.mostrarToast('No hay archivo activo para analizar', 'warning');
      return;
    }
    const monaco = (window as any).monaco;
    const model = this.editor.getModel?.();
    if (!monaco?.editor || !model) {
      this.mostrarToast('El editor aún no está listo', 'warning');
      return;
    }

    const markers = monaco.editor.getModelMarkers({ resource: model.uri }) as Array<{
      severity: number;
      message: string;
      startLineNumber: number;
      startColumn: number;
    }>;

    const markerSeverity = monaco.MarkerSeverity;
    this.sintaxisErrores = markers
      .filter(m => m.severity === markerSeverity.Error)
      .map(m => `L${m.startLineNumber}:${m.startColumn} — ${m.message}`);

    this.sintaxisWarnings = markers
      .filter(m => m.severity === markerSeverity.Warning)
      .map(m => `L${m.startLineNumber}:${m.startColumn} — ${m.message}`);

    this.mostrarAIPanel = true;
    if (!this.sintaxisErrores.length && !this.sintaxisWarnings.length) {
      this.mostrarToast('No se detectaron errores de sintaxis en el archivo activo', 'success');
    }
    this.cdr.markForCheck();
  }

  async invitarUsuario() {
    const alert = await this.alertCtrl.create({
      header: 'Invitar colaborador',
      message: `Escribe el email para invitar al proyecto "${this.tema.titulo}".`,
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
        { text: 'Cancelar', role: 'cancel', cssClass: 'alert-button-cancel', handler: () => {} },
        {
          text: 'Invitar',
          cssClass: 'alert-button-confirm',
          handler: (data) => {
            const email = data.email?.trim();
            const emailValido = !!email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            if (!emailValido) {
              this.mostrarToast('Email inválido', 'warning');
              return false;
            }
            this.diarioService.invitarColaborador(this.tema.id, email).subscribe({
              next: () => { this.mostrarToast(`Invitación enviada a ${email}`, 'success'); this.cargarColaboradores(); },
              error: (error: HttpErrorResponse) =>
                this.mostrarToast(this.getApiErrorMessage(error, 'No se pudo enviar la invitación'), 'danger')
            });
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async abrirAccionesMovil() {
    const alert = await this.alertCtrl.create({
      header: 'Más acciones',
      cssClass: 'custom-alert',
      buttons: [
        {
          text: 'Invitar usuario',
          handler: () => {
            this.ejecutarTrasCerrarAlert(() => this.invitarUsuario());
          }
        },
        {
          text: 'Descargar CSV',
          handler: () => {
            this.ejecutarTrasCerrarAlert(() => this.descargarCSV());
          }
        },
        {
          text: 'Descargar MD',
          handler: () => {
            this.ejecutarTrasCerrarAlert(() => this.descargarMarkdown());
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'alert-button-cancel'
        }
      ]
    });
    await alert.present();
  }

  abrirCamaraIA(){
    if (this.archivos.length === 0) {
      this.mostrarToast('Crea un archivo antes de importar código por imagen', 'warning');
      return;
    }
    
    if (this.archivos.length === 1) {
      this.seleccionarArchivo(this.archivos[0]);
      this.abrirSelectorImagen();
      return;
    }

    // Mostrar selector de archivo si hay múltiples
    const fileButtons: any[] = this.archivos.map(a => ({
      text: a.filename ?? 'archivo.txt',
      handler: () => {
        this.seleccionarArchivo(a);
        this.abrirSelectorImagen();
      }
    }));

    fileButtons.push({
      text: 'Cancelar',
      role: 'cancel',
      handler: () => {}
    });

    this.alertCtrl.create({
      header: 'Seleccionar archivo destino',
      message: '¿Dónde quieres pegar el código de la imagen?',
      cssClass: 'custom-alert',
      buttons: fileButtons
    }).then(alert => alert.present());
  }

  private abrirSelectorImagen() {
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
    if (!this.archivoActivo) {
      this.mostrarToast('Abre o crea un archivo antes de importar código por imagen', 'warning');
      return;
    }
    this.cargandoVision = true;
    this.cdr.markForCheck();
    this.diarioService.extraerCodigoDeImagen(imageBase64, mimeType).subscribe({
      next: ({ texto }) => {
        const separador = this.contenidoEditor.trim() ? '\n\n' : '';
        this.contenidoEditor = `${this.contenidoEditor}${separador}${texto}`;
        if (this.editor) {
          this.editor.setValue(this.contenidoEditor);
        }
        this.tienesCambios = true;
        this.cargandoVision = false;
        this.mostrarToast('Código importado desde imagen', 'success');
        this.cdr.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.cargandoVision = false;
        this.mostrarToast(this.getApiErrorMessage(error, 'No se pudo procesar la imagen'), 'danger');
        this.cdr.markForCheck();
      }
    });
  }

  commitLog_guardar() {
    if (!this.permiteGestionCommits) return;
    if (!this.nuevoCommitTexto.trim()) return;
    this.diarioService.crearEntrada(this.nuevoCommitTexto, this.tema.id, 'PRIVADO', 'LOG').subscribe({
      next: (entrada) => {
        this.commitLog = [entrada, ...this.commitLog];
        this.nuevoCommitTexto = '';
        this.cargarCommitLog();
        this.mostrarToast('Commit registrado', 'success');
        this.cdr.markForCheck();
      },
      error: (error: HttpErrorResponse) =>
        this.mostrarToast(this.getApiErrorMessage(error, 'Error al guardar commit'), 'danger')
    });
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      this.guardarArchivo();
    }
  }

  getLenguaje(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() ?? '';
    const map: Record<string, string> = {
      // Web
      html: 'html', htm: 'html',
      css: 'css', scss: 'scss', less: 'less',
      js: 'javascript', jsx: 'javascript', mjs: 'javascript', cjs: 'javascript',
      ts: 'typescript', tsx: 'typescript',
      // Data / Config
      json: 'json', jsonc: 'json',
      yaml: 'yaml', yml: 'yaml',
      toml: 'ini', ini: 'ini', env: 'ini',
      xml: 'xml', svg: 'xml',
      // Markup
      md: 'markdown', mdx: 'markdown',
      // Backend
      py: 'python',
      java: 'java', kt: 'kotlin', kts: 'kotlin',
      go: 'go', rs: 'rust', rb: 'ruby', php: 'php',
      cs: 'csharp', cpp: 'cpp', c: 'c', h: 'c', hpp: 'cpp',
      swift: 'swift', dart: 'dart', r: 'r',
      // Shell / Scripts
      sh: 'shell', bash: 'shell', zsh: 'shell', ps1: 'powershell',
      // DB / Query
      sql: 'sql', graphql: 'graphql', gql: 'graphql',
      // Infra
      tf: 'hcl', proto: 'proto',
    };
    return map[ext] ?? 'plaintext';
  }

  getLineCount(): number {
    return this.contenidoEditor.split('\n').length;
  }

  private getDefaultContent(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() ?? '';
    const templates: Record<string, string> = {
      html: `<!DOCTYPE html>\n<html lang="es">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${this.tema.titulo}</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n\n  <script src="script.js"></script>\n</body>\n</html>`,
      css:  `/* ${this.tema.titulo} */\n\n* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}\n\nbody {\n  font-family: sans-serif;\n}\n`,
      scss: `// ${this.tema.titulo}\n\n$primary: #3b82f6;\n\n* { margin: 0; padding: 0; box-sizing: border-box; }\n\nbody {\n  font-family: sans-serif;\n}\n`,
      js:   `// ${this.tema.titulo}\n\ndocument.addEventListener('DOMContentLoaded', () => {\n\n});\n`,
      ts:   `// ${this.tema.titulo}\n\nconst saludo = (nombre: string): string => \`Hola, \${nombre}!\`;\n\nconsole.log(saludo('mundo'));\n`,
      py:   `# ${this.tema.titulo}\n\ndef main():\n    print("Hola, mundo!")\n\nif __name__ == "__main__":\n    main()\n`,
      md:   `# ${this.tema.titulo}\n\n## Descripción\n\n`,
      json: `{\n\n}\n`,
      yaml: `# ${this.tema.titulo}\n`,
      sql:  `-- ${this.tema.titulo}\n\nSELECT *\nFROM tabla\nWHERE condicion = true;\n`,
      sh:   `#!/bin/bash\n# ${this.tema.titulo}\n\necho "Hola, mundo!"\n`,
    };
    return templates[ext] ?? `// ${filename}\n`;
  }

  private get carpetasStorageKey(): string {
    return `diary-folders-${this.tema.id}`;
  }

  private cargarCarpetasManual() {
    try {
      const raw = localStorage.getItem(this.carpetasStorageKey);
      console.log('[IDE] Cargando carpetas de localStorage:', { key: this.carpetasStorageKey, raw });
      if (!raw) {
        this.carpetasManual = [];
        console.log('[IDE] Sin carpetas guardadas');
        return;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        this.carpetasManual = parsed
          .map(v => typeof v === 'string' ? this.normalizarRutaCarpeta(v) : '')
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b));
      } else {
        this.carpetasManual = [];
      }
      console.log('[IDE] Carpetas cargadas:', this.carpetasManual);
    } catch (e) {
      console.error('[IDE] Error cargando carpetas:', e);
      this.carpetasManual = [];
    }
  }

  private guardarCarpetasManual() {
    try {
      localStorage.setItem(this.carpetasStorageKey, JSON.stringify(this.carpetasManual));
    } catch {
      // noop: no bloqueamos la edición por fallo de storage
    }
  }

  private normalizarRutaCarpeta(path: string): string {
    return path
      .replace(/\\/g, '/')
      .replace(/\/{2,}/g, '/')
      .replace(/^\/+|\/+$/g, '')
      .trim();
  }

  private carpetaTieneArchivos(path: string): boolean {
    return this.archivos.some(a =>
      this.normalizarRutaArchivo(a.filename ?? '').startsWith(`${path}/`)
    );
  }

  private normalizarArchivos(archivos: DiarioDto[]): DiarioDto[] {
    return archivos.map((archivo, index) => ({
      ...archivo,
      tipo: 'FILE',
      filename: this.resolverNombreArchivo(archivo, index + 1)
    }));
  }

  private resolverNombreArchivo(entrada: DiarioDto, fallbackIndex = 1): string {
    const directo = entrada.filename?.trim();
    if (directo) return this.normalizarRutaArchivo(directo);

    const desdeComentario = this.extraerFilenameDesdeComentario(entrada.contenido ?? '');
    if (desdeComentario) return this.normalizarRutaArchivo(desdeComentario);

    const extension = this.inferirExtension(entrada.contenido ?? '');
    const idParte = entrada.id ?? fallbackIndex;
    return `archivo-${idParte}.${extension}`;
  }

  private normalizarRutaArchivo(path: string): string {
    return path
      .replace(/\\/g, '/')
      .replace(/\/{2,}/g, '/')
      .replace(/^\/+|\/+$/g, '');
  }

  private extraerFilenameDesdeComentario(contenido: string): string | null {
    const primeraLinea = (contenido.split('\n')[0] ?? '').trim();
    const match = primeraLinea.match(/^\/\/\s*([A-Za-z0-9_\-./\\]+\.[A-Za-z0-9]+)\s*$/);
    return match ? match[1] : null;
  }

  private inferirExtension(contenido: string): string {
    const text = contenido.trim();
    if (/<!DOCTYPE html>|<html[\s>]/i.test(text)) return 'html';
    if (/document\.addEventListener\(|console\.log\(/.test(text)) return 'js';
    if (/^\s*\/\*\s*Estilos|{[\s\S]*}/.test(text) && /font-family|box-sizing|margin:/.test(text)) return 'css';
    if (/^\s*#\s+/.test(text)) return 'md';
    if (/^\s*[\[{]/.test(text) && /:\s*/.test(text)) return 'json';
    return 'txt';
  }

  private esEntradaArchivo(entrada: DiarioDto): boolean {
    if (entrada.tipo === 'FILE') return true;
    if ((entrada.filename ?? '').trim()) return true;
    const contenido = entrada.contenido ?? '';
    if (!contenido.trim()) return false;
    if (this.extraerFilenameDesdeComentario(contenido)) return true;
    return /<!DOCTYPE html>|<html[\s>]|document\.addEventListener\(|\/\*\s*Estilos/i.test(contenido);
  }

  private async initMonaco() {
    if (this.monacoLoaded || !(window as any).require) return;

    (window as any).require.config({ paths: { vs: 'assets/monaco/vs' } });
    (window as any).require(['vs/editor/editor.main'], () => {
      this.monacoLoaded = true;
      this.crearEditorInstance();
    });
  }

  private crearEditorInstance() {
    const container = this.editorContainerRef?.nativeElement;
    if (!container || !(window as any).monaco) return;

    this.editor = (window as any).monaco.editor.create(container, {
      value: this.contenidoEditor,
      language: this.getLenguaje(this.archivoActivo?.filename ?? ''),
      theme: 'vs-dark',
      fontSize: 14,
      fontFamily: "'Consolas', 'Courier New', monospace",
      lineHeight: 22,
      minimap: { enabled: false },
      readOnly: this.readOnly,
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      automaticLayout: true,
      padding: { top: 16, bottom: 16 },
      renderLineHighlight: 'line',
      scrollbar: {
        verticalScrollbarSize: 6,
        horizontalScrollbarSize: 6
      },
      autoIndent: 'keep',
      formatOnPaste: false
    });

    this.editor.onDidChangeModelContent(() => {
      this.onEditorChange(this.editor.getValue());
      this.cdr.markForCheck();
    });

    container.addEventListener('paste', (e: ClipboardEvent) => {
      const lang = this.getLenguaje(this.archivoActivo?.filename ?? '');
      if (lang !== 'python') return;
      e.preventDefault();
      e.stopPropagation();
      const text = (e.clipboardData?.getData('text/plain') ?? '')
        .replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      const selection = this.editor.getSelection();
      this.editor.executeEdits('paste', [{ range: selection, text, forceMoveMarkers: true }]);
    }, true);
  }

  private async mostrarToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({ message, duration: 2000, color, position: 'bottom' });
    toast.present();
  }

  private getApiErrorMessage(error: unknown, fallback: string): string {
    if (error && typeof error === 'object' && 'error' in error) {
      const e = error as HttpErrorResponse;
      const objectError = typeof e.error === 'object' && e.error ? e.error as Record<string, unknown> : null;
      const rawMessage = objectError && typeof objectError['message'] === 'string'
        ? objectError['message']
        : null;
      const backendMessage =
        rawMessage ??
        (typeof e.error === 'string' ? e.error : null);
      if (backendMessage && typeof backendMessage === 'string' && backendMessage.trim()) {
        return backendMessage;
      }
    }
    return fallback;
  }

  descargarCSV() {
    if (this.exportando) return;
    this.exportando = true;
    this.diarioService.exportarTemaCsv(this.tema.id).subscribe({
      next: (blob: Blob) => {
        const filename = `${this.tema.titulo || 'proyecto'}-${Date.now()}.csv`;
        if (Capacitor.isNativePlatform()) {
          this.exportarNativo(blob, filename, `Archivo ${this.tema.titulo || 'proyecto'} (.csv)`);
          return;
        }
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
        this.exportando = false;
        this.mostrarToast('Proyecto descargado en CSV', 'success');
      },
      error: (error: HttpErrorResponse) => {
        this.exportando = false;
        this.mostrarToast(this.getApiErrorMessage(error, 'Error al descargar CSV'), 'danger');
      }
    });
  }

  descargarMarkdown() {
    if (this.exportando) return;
    this.exportando = true;
    // Generar MD desde los archivos locales
    let markdown = `# ${this.tema.titulo || 'Proyecto'}\n\n`;
    markdown += `**Fecha:** ${new Date().toLocaleString()}\n\n`;
    
    if (this.archivos.length === 0) {
      markdown += '_Sin archivos_\n';
    } else {
      markdown += '## Archivos\n\n';
      this.archivos.forEach(archivo => {
        markdown += `### \`${archivo.filename || 'archivo.txt'}\`\n\n`;
        markdown += '```\n';
        markdown += (archivo.contenido || '// vacío').substring(0, 1000);
        if ((archivo.contenido || '').length > 1000) {
          markdown += '\n... (truncado)\n';
        }
        markdown += '\n```\n\n';
      });
    }

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const filename = `${this.tema.titulo || 'proyecto'}-${Date.now()}.md`;
    if (Capacitor.isNativePlatform()) {
      this.exportarNativo(blob, filename, `Archivo ${this.tema.titulo || 'proyecto'} (.md)`);
      return;
    }
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
    this.exportando = false;
    this.mostrarToast('Proyecto descargado en Markdown', 'success');
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
          this.mostrarToast(`Archivo exportado: ${filename}`, 'success');
        } catch {
          this.mostrarToast(`Archivo guardado: ${filename}`, 'success');
        }
      } catch {
        this.mostrarToast('No se pudo exportar el archivo', 'danger');
      } finally {
        this.exportando = false;
      }
    };
    reader.readAsDataURL(blob);
  }

  private ejecutarTrasCerrarAlert(action: () => void) {
    setTimeout(() => action(), 220);
  }
}
