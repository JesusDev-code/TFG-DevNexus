import {
  Component, Input, OnInit, OnDestroy, AfterViewInit, ChangeDetectionStrategy,
  ChangeDetectorRef, inject, HostListener, ElementRef, ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, refreshOutline, openOutline, alertCircleOutline } from 'ionicons/icons';
import { DiarioDto } from 'src/app/core/models/models';

interface SandboxError {
  msg: string;
  line?: number;
  col?: number;
}

@Component({
  selector: 'app-sandbox-preview',
  standalone: true,
  imports: [CommonModule, IonIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sandbox-shell">
      <!-- Header -->
      <div class="sandbox-header">
        <div class="sandbox-dots">
          <span class="dot red"></span>
          <span class="dot yellow"></span>
          <span class="dot green"></span>
        </div>
        <div class="sandbox-url">
          <ion-icon name="open-outline"></ion-icon>
          <span>{{ nombreProyecto }} — Preview</span>
        </div>
        <div class="sandbox-actions">
          <button class="sb-btn" (click)="recargar()" title="Recargar">
            <ion-icon name="refresh-outline"></ion-icon>
          </button>
          <button class="sb-btn close" (click)="cerrar()" title="Cerrar">
            <ion-icon name="close-outline"></ion-icon>
          </button>
        </div>
      </div>

      <!-- Iframe -->
      <div class="sandbox-frame-wrap">
        <iframe #previewFrame
                class="sandbox-frame"
                sandbox="allow-scripts"
                title="Preview">
        </iframe>
      </div>

      <!-- Console panel -->
      <div class="sandbox-console" [class.has-errors]="sandboxErrors.length > 0">
        <div class="console-header">
          <ion-icon name="alert-circle-outline" *ngIf="sandboxErrors.length"></ion-icon>
          <span>Consola</span>
          <span class="error-count" *ngIf="sandboxErrors.length">{{ sandboxErrors.length }} error(es)</span>
          <button class="console-clear" *ngIf="sandboxErrors.length" (click)="sandboxErrors = []">Limpiar</button>
        </div>
        <div class="console-body">
          <div *ngFor="let err of sandboxErrors" class="console-error">
            <ion-icon name="alert-circle-outline"></ion-icon>
            <span>{{ err.msg }}<span *ngIf="err.line"> — línea {{ err.line }}</span></span>
          </div>
          <div *ngIf="!sandboxErrors.length" class="console-ok">
            Sin errores detectados
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./sandbox-preview.component.scss']
})
export class SandboxPreviewComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() archivos: DiarioDto[] = [];
  @Input() archivoActivoId?: number;
  @Input() archivoActivoFilename?: string;
  @Input() nombreProyecto = '';
  @ViewChild('previewFrame') previewFrameRef!: ElementRef<HTMLIFrameElement>;

  private modalCtrl = inject(ModalController);
  private cdr = inject(ChangeDetectorRef);

  sandboxContent = '';
  sandboxErrors: SandboxError[] = [];
  private previewObjectUrl: string | null = null;

  constructor() {
    addIcons({
      'close-outline': closeOutline,
      'refresh-outline': refreshOutline,
      'open-outline': openOutline,
      'alert-circle-outline': alertCircleOutline,
    });
  }

  ngOnInit() {
    this.sandboxContent = this.buildSandboxContent();
  }

  ngAfterViewInit() {
    this.renderInIframe();
  }

  ngOnDestroy() {
    if (this.previewObjectUrl) {
      URL.revokeObjectURL(this.previewObjectUrl);
      this.previewObjectUrl = null;
    }
    window.removeEventListener('message', this.onSandboxMessage);
  }

  @HostListener('window:message', ['$event'])
  onSandboxMessage(event: MessageEvent) {
    if (event.data?.type === 'sandbox-error' || event.data?.type === 'console-error') {
      this.sandboxErrors.push({
        msg: event.data.msg ?? (event.data.args?.join(' ') ?? 'Error desconocido'),
        line: event.data.line,
        col: event.data.col
      });
      this.cdr.markForCheck();
    }
  }

  recargar() {
    this.sandboxErrors = [];
    this.sandboxContent = '';
    setTimeout(() => {
      this.sandboxContent = this.buildSandboxContent();
      this.renderInIframe();
      this.cdr.markForCheck();
    }, 50);
  }

  cerrar() {
    this.modalCtrl.dismiss();
  }

  private buildSandboxContent(): string {
    const archivoActivo = this.archivos.find(f => f.id === this.archivoActivoId);
    const htmlFile = this.seleccionarArchivoHtml(archivoActivo);
    const cssFiles = this.archivos.filter(f => (f.filename ?? '').toLowerCase().endsWith('.css'));
    const jsFiles = this.archivos.filter(f => (f.filename ?? '').toLowerCase().endsWith('.js'));

    const cssByPath = new Map(cssFiles.map(f => [this.normPath(f.filename ?? ''), f.contenido ?? '']));
    const jsByPath = new Map(jsFiles.map(f => [this.normPath(f.filename ?? ''), f.contenido ?? '']));
    const usedCss = new Set<string>();
    const usedJs = new Set<string>();

    let htmlBody = this.normalizarHtmlPreview(
      htmlFile?.contenido ?? '<p style="font-family:sans-serif;padding:20px;color:#888">No hay index.html en el proyecto.</p>'
    );

    htmlBody = htmlBody.replace(/<link[^>]*href=["']([^"']+\.css)["'][^>]*>/gi, (_m, href: string) => {
      const key = this.findFileKey(href, cssByPath);
      if (!key) return '';
      usedCss.add(key);
      return `<style>\n${cssByPath.get(key) ?? ''}\n</style>`;
    });

    htmlBody = htmlBody.replace(/<script[^>]*src=["']([^"']+\.js)["'][^>]*>\s*<\/script>/gi, (_m, src: string) => {
      const key = this.findFileKey(src, jsByPath);
      if (!key) return '';
      usedJs.add(key);
      return `<script>\n${jsByPath.get(key) ?? ''}\n</script>`;
    });

    const extraCss = Array.from(cssByPath.entries())
      .filter(([k]) => !usedCss.has(k))
      .map(([, v]) => v)
      .join('\n');

    const extraJs = Array.from(jsByPath.entries())
      .filter(([k]) => !usedJs.has(k))
      .map(([, v]) => v)
      .join('\n');

    if (/<\/body>/i.test(htmlBody)) {
      htmlBody = htmlBody.replace(/<\/body>/i, `<script>${this.errorInterceptor()}</script>\n<script>${extraJs}</script>\n</body>`);
      if (/<\/head>/i.test(htmlBody)) {
        htmlBody = htmlBody.replace(/<\/head>/i, `<style>${extraCss}</style>\n</head>`);
      } else {
        htmlBody = `<head><style>${extraCss}</style></head>\n${htmlBody}`;
      }
      return htmlBody;
    }

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.nombreProyecto}</title>
  <style>${extraCss}</style>
</head>
<body>
${htmlBody}
<script>${this.errorInterceptor()}</script>
<script>${extraJs}</script>
</body>
</html>`;
  }

  private seleccionarArchivoHtml(archivoActivo?: DiarioDto): DiarioDto | undefined {
    const esHtml = (f: DiarioDto) => {
      const name = (f.filename ?? '').toLowerCase();
      const raw = (f.contenido ?? '').trim();
      return name.endsWith('.html') || name.endsWith('.htm') || /<!doctype html>|<html[\s>]|<head[\s>]|<body[\s>]/i.test(raw);
    };

    if (archivoActivo && esHtml(archivoActivo)) return archivoActivo;
    if (this.archivoActivoFilename) {
      const byName = this.archivos.find(f => (f.filename ?? '') === this.archivoActivoFilename);
      if (byName && esHtml(byName)) return byName;
    }
    return this.archivos.find(esHtml);
  }

  private normPath(path: string): string {
    return path.replace(/\\/g, '/').replace(/^\/+/, '').toLowerCase();
  }

  private findFileKey(importPath: string, store: Map<string, string>): string | null {
    const clean = this.normPath(importPath).split('?')[0].split('#')[0];
    if (store.has(clean)) return clean;
    const byName = clean.split('/').pop() ?? clean;
    for (const key of store.keys()) {
      if (key.endsWith(`/${byName}`) || key === byName) return key;
    }
    return null;
  }

  private errorInterceptor(): string {
    return `
window.onerror = function(msg, src, line, col) {
  window.parent.postMessage({ type: 'sandbox-error', msg: String(msg), line: line, col: col }, '*');
};
const _ce = console.error.bind(console);
console.error = function() {
  _ce.apply(console, arguments);
  window.parent.postMessage({ type: 'console-error', args: Array.from(arguments).map(String) }, '*');
};`;
  }

  private renderInIframe() {
    const iframe = this.previewFrameRef?.nativeElement;
    if (!iframe) return;
    if (this.previewObjectUrl) {
      URL.revokeObjectURL(this.previewObjectUrl);
      this.previewObjectUrl = null;
    }
    const blob = new Blob([this.sandboxContent], { type: 'text/html;charset=utf-8' });
    this.previewObjectUrl = URL.createObjectURL(blob);
    iframe.src = this.previewObjectUrl;
  }

  private normalizarHtmlPreview(raw: string): string {
    let content = raw ?? '';

    // Soporta pegado desde markdown: ```html ... ```
    content = content.replace(/^```(?:html)?\s*[\r\n]+/i, '').replace(/[\r\n]+```$/, '');

    // Si vino escapado (&lt;div&gt;), lo decodificamos para renderizar de verdad
    if (!/<[a-z!][\s\S]*>/i.test(content) && /&lt;\/?[a-z]/i.test(content)) {
      const txt = document.createElement('textarea');
      txt.innerHTML = content;
      content = txt.value;
    }

    return content;
  }
}

