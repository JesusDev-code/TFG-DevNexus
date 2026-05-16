import { Component, ChangeDetectionStrategy, inject, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonGrid, IonRow, IonCol, IonIcon, IonSpinner, ToastController, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline, timeOutline, lockClosedOutline,
  chatbubbleEllipsesOutline, sendOutline, closeOutline, codeSlashOutline,
  documentTextOutline, globeOutline, playOutline
} from 'ionicons/icons';
import { MarkdownModule } from 'ngx-markdown';
import { DiarioService } from 'src/app/services/diario.service';
import { AuthService } from 'src/app/services/auth.service';
import { DiarioTemaDto } from 'src/app/core/models/models';
import { SandboxPreviewComponent } from '../user-profile/user-diary/sandbox-preview/sandbox-preview.component';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.page.html',
  styleUrls: ['./blog.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonSpinner, IonIcon, IonGrid, IonRow, IonCol, MarkdownModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlogPage {
  private diarioService = inject(DiarioService);
  public authService = inject(AuthService);
  private toastCtrl = inject(ToastController);
  private modalCtrl = inject(ModalController);

  temas = signal<DiarioTemaDto[]>([]);
  cargando = signal(false);

  selectedTema = signal<DiarioTemaDto | null>(null);
  entradas = signal<any[]>([]);
  comentarios = signal<any[]>([]);
  cargandoEntradas = signal(false);
  cargandoComentarios = signal(false);
  nuevoComentario = signal('');

  constructor() {
    addIcons({
      personOutline, timeOutline, lockClosedOutline,
      chatbubbleEllipsesOutline, sendOutline, closeOutline,
      codeSlashOutline, documentTextOutline, globeOutline, playOutline
    });

    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.cargarTemas();
      } else {
        this.temas.set([]);
        this.cargando.set(false);
      }
    });
  }

  cargarTemas() {
    this.cargando.set(true);
    this.diarioService.getTemaPublicos().subscribe({
      next: (res) => { this.temas.set(res); this.cargando.set(false); },
      error: () => this.cargando.set(false)
    });
  }

  abrirTema(tema: DiarioTemaDto) {
    this.selectedTema.set(tema);
    this.entradas.set([]);
    this.comentarios.set([]);
    this.nuevoComentario.set('');

    this.cargandoEntradas.set(true);
    this.diarioService.getEntradasPublicasDeTema(tema.id).subscribe({
      next: (res) => {
        this.entradas.set(res);
        this.cargandoEntradas.set(false);
        this.cargarComentariosBlog(tema.id);
      },
      error: () => this.cargandoEntradas.set(false)
    });
  }

  private cargarComentariosBlog(temaId: number) {
    this.cargandoComentarios.set(true);
    this.diarioService.getComentariosComunidad(temaId).subscribe({
      next: (res) => { this.comentarios.set(res); this.cargandoComentarios.set(false); },
      error: () => this.cargandoComentarios.set(false)
    });
  }

  cerrarModal() { this.selectedTema.set(null); }

  enviarComentario() {
    const tema = this.selectedTema();
    const texto = this.nuevoComentario().trim();
    if (!tema || !texto) return;
    this.nuevoComentario.set('');
    this.diarioService.agregarComentarioComunidad(tema.id, texto).subscribe({
      next: (nuevo) => this.comentarios.set([...this.comentarios(), nuevo]),
      error: () => {
        this.nuevoComentario.set(texto);
        this.presentToast('Error al comentar', 'danger');
      }
    });
  }

  private async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({ message, duration: 2000, color, position: 'bottom' });
    toast.present();
  }

  getGradient(id: number): string {
    const gradients = [
      'linear-gradient(135deg, #7c3aed, #4f46e5)',
      'linear-gradient(135deg, #2563eb, #0891b2)',
      'linear-gradient(135deg, #059669, #0d9488)',
      'linear-gradient(135deg, #d97706, #b45309)',
      'linear-gradient(135deg, #dc2626, #9f1239)',
      'linear-gradient(135deg, #7c3aed, #db2777)',
    ];
    return gradients[(id || 0) % gradients.length];
  }

  getInitial(titulo: string): string {
    return titulo?.charAt(0).toUpperCase() || '?';
  }

  getChipClass(id: number): string {
    const clases = ['tutorial', 'design', 'perf', 'backend'];
    return clases[(id || 0) % clases.length];
  }

  getLanguage(filename: string): string {
    const ext = filename?.split('.').pop()?.toLowerCase() ?? '';
    const map: Record<string, string> = {
      ts: 'typescript', js: 'javascript', html: 'html', css: 'css', scss: 'scss',
      kt: 'kotlin', java: 'java', py: 'python', go: 'go', rs: 'rust',
      sql: 'sql', json: 'json', yaml: 'yaml', yml: 'yaml', xml: 'xml',
      sh: 'bash', md: 'markdown', tf: 'hcl', dockerfile: 'dockerfile',
      cpp: 'cpp', c: 'c', cs: 'csharp', rb: 'ruby', php: 'php',
      swift: 'swift', dart: 'dart', r: 'r',
    };
    return map[ext] ?? '';
  }

  getCodeBlock(entrada: any): string {
    const lang = this.getLanguage(entrada.filename ?? '');
    return '```' + lang + '\n' + (entrada.contenido ?? '') + '\n```';
  }

  entradasArchivos(entradas: any[]): any[] {
    return entradas.filter(e => e.tipo === 'FILE');
  }

  entradasLog(entradas: any[]): any[] {
    return entradas.filter(e => e.tipo !== 'FILE');
  }

  tienePreview(): boolean {
    return this.entradasArchivos(this.entradas()).some(e =>
      /\.(html?|css|js)$/i.test(e.filename ?? '')
    );
  }

  async abrirPreview() {
    const tema = this.selectedTema();
    if (!tema) return;
    const archivos = this.entradasArchivos(this.entradas());
    const modal = await this.modalCtrl.create({
      component: SandboxPreviewComponent,
      componentProps: {
        archivos,
        archivoActivoId: archivos[0]?.id,
        archivoActivoFilename: archivos[0]?.filename,
        nombreProyecto: tema.tituloPublicacion || tema.titulo
      },
      cssClass: 'fullscreen-modal'
    });
    await modal.present();
  }
}
