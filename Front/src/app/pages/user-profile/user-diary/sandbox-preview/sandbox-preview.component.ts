import {
  Component, Input, OnInit, OnDestroy, AfterViewInit, ChangeDetectionStrategy,
  ChangeDetectorRef, inject, HostListener, ElementRef, ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, refreshOutline, openOutline, alertCircleOutline, terminalOutline } from 'ionicons/icons';
import { DiarioDto } from 'src/app/core/models/models';
import * as ts from 'typescript';

type SandboxMode = 'web' | 'typescript' | 'python';

interface ConsoleLine {
  kind: 'error' | 'log';
  msg: string;
  line?: number;
}

@Component({
  selector: 'app-sandbox-preview',
  standalone: true,
  imports: [CommonModule, IonIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sandbox-shell">
      <div class="sandbox-header">
        <div class="sandbox-dots">
          <span class="dot red"></span>
          <span class="dot yellow"></span>
          <span class="dot green"></span>
        </div>
        <div class="sandbox-url">
          <ion-icon name="open-outline"></ion-icon>
          <span>{{ nombreProyecto }} — {{ modeLabel }}</span>
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

      <div class="sandbox-frame-wrap">
        <iframe #previewFrame
                class="sandbox-frame"
                sandbox="allow-scripts"
                title="Preview">
        </iframe>
      </div>

      <div class="sandbox-console" [class.has-errors]="hasErrors">
        <div class="console-header">
          <ion-icon name="alert-circle-outline" *ngIf="hasErrors"></ion-icon>
          <ion-icon name="terminal-outline" class="terminal-icon" *ngIf="!hasErrors"></ion-icon>
          <span>Consola</span>
          <span class="error-count" *ngIf="hasErrors">{{ errorCount }} error(es)</span>
          <button class="console-clear" *ngIf="consoleLines.length" (click)="limpiarConsola()">Limpiar</button>
        </div>
        <div class="console-body">
          <div *ngIf="isLoading" class="console-loading">
            <span class="loading-spinner">⟳</span> {{ loadingMsg }}
          </div>
          <div *ngFor="let line of consoleLines"
               [class.console-error]="line.kind === 'error'"
               [class.console-log]="line.kind === 'log'">
            <ion-icon name="alert-circle-outline" *ngIf="line.kind === 'error'"></ion-icon>
            <span>{{ line.msg }}<span *ngIf="line.line"> — línea {{ line.line }}</span></span>
          </div>
          <div *ngIf="!consoleLines.length && !isLoading" class="console-ok">
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
  sandboxErrors: { msg: string; line?: number; col?: number }[] = [];
  consoleLines: ConsoleLine[] = [];
  isLoading = false;
  loadingMsg = '';
  sandboxMode: SandboxMode = 'web';

  private previewObjectUrl: string | null = null;
  private pythonTimeoutId: ReturnType<typeof setTimeout> | null = null;

  get hasErrors(): boolean {
    return this.consoleLines.some(l => l.kind === 'error');
  }

  get errorCount(): number {
    return this.consoleLines.filter(l => l.kind === 'error').length;
  }

  get modeLabel(): string {
    return { web: 'Preview', typescript: 'TypeScript', python: 'Python' }[this.sandboxMode];
  }

  constructor() {
    addIcons({
      'close-outline': closeOutline,
      'refresh-outline': refreshOutline,
      'open-outline': openOutline,
      'alert-circle-outline': alertCircleOutline,
      'terminal-outline': terminalOutline,
    });
  }

  ngOnInit() {
    this.sandboxMode = this.detectMode();
    this.sandboxContent = this.buildSandboxContent();
  }

  ngAfterViewInit() {
    this.renderInIframe();
  }

  ngOnDestroy() {
    this.clearPythonTimeout();
    if (this.previewObjectUrl) {
      URL.revokeObjectURL(this.previewObjectUrl);
      this.previewObjectUrl = null;
    }
    window.removeEventListener('message', this.onSandboxMessage);
  }

  @HostListener('window:message', ['$event'])
  onSandboxMessage(event: MessageEvent) {
    const data = event.data;
    if (!data?.type) return;

    switch (data.type) {
      case 'sandbox-error': {
        const msg = data.msg ?? 'Error desconocido';
        this.consoleLines.push({ kind: 'error', msg, line: data.line });
        this.sandboxErrors.push({ msg, line: data.line, col: data.col });
        break;
      }
      case 'console-error': {
        const msg = data.args?.join(' ') ?? data.msg ?? 'Error en consola';
        this.consoleLines.push({ kind: 'error', msg });
        this.sandboxErrors.push({ msg });
        break;
      }
      case 'console-log':
        this.consoleLines.push({ kind: 'log', msg: data.msg });
        break;
      case 'python-loading':
        this.isLoading = true;
        this.loadingMsg = 'Cargando intérprete Python...';
        this.startPythonTimeout();
        break;
      case 'python-ready':
        this.isLoading = false;
        this.loadingMsg = '';
        this.clearPythonTimeout();
        break;
      case 'python-output':
        this.consoleLines.push({ kind: 'log', msg: data.msg });
        break;
      case 'python-input-needed': {
        const prompt = data.prompt ? data.prompt : '';
        this.isLoading = true;
        this.loadingMsg = prompt ? `Esperando entrada: ${prompt}` : 'Esperando entrada...';
        this.clearPythonTimeout();
        break;
      }
      case 'python-input-provided':
        this.isLoading = false;
        this.loadingMsg = '';
        this.consoleLines.push({ kind: 'log', msg: `> ${data.prompt ?? ''}${data.value ?? ''}` });
        break;
      case 'python-input-eof':
        this.isLoading = false;
        this.loadingMsg = '';
        this.consoleLines.push({ kind: 'log', msg: '> [EOF — entrada cancelada]' });
        break;
    }

    this.cdr.markForCheck();
  }

  recargar() {
    this.consoleLines = [];
    this.sandboxErrors = [];
    this.isLoading = false;
    this.clearPythonTimeout();
    this.sandboxMode = this.detectMode();
    this.sandboxContent = '';
    setTimeout(() => {
      this.sandboxContent = this.buildSandboxContent();
      this.renderInIframe();
      this.cdr.markForCheck();
    }, 50);
  }

  limpiarConsola() {
    this.consoleLines = [];
    this.sandboxErrors = [];
    this.cdr.markForCheck();
  }

  cerrar() {
    this.modalCtrl.dismiss();
  }

  private detectMode(): SandboxMode {
    const names = this.archivos.map(f => (f.filename ?? '').toLowerCase());
    if (names.some(n => n.endsWith('.py'))) return 'python';
    if (names.some(n => n.endsWith('.ts') && !n.endsWith('.spec.ts') && !n.endsWith('.d.ts'))) return 'typescript';
    return 'web';
  }

  buildSandboxContent(): string {
    if (this.sandboxMode === 'python') return this.buildPythonContent();
    if (this.sandboxMode === 'typescript') return this.buildTypescriptContent();
    return this.buildWebContent();
  }

  private buildWebContent(): string {
    const archivoActivo = this.archivos.find(f => f.id === this.archivoActivoId);
    const htmlFile = this.seleccionarArchivoHtml(archivoActivo);
    const cssFiles = this.archivos.filter(f => (f.filename ?? '').toLowerCase().endsWith('.css'));
    const jsFiles  = this.archivos.filter(f => (f.filename ?? '').toLowerCase().endsWith('.js'));

    const cssByPath = new Map(cssFiles.map(f => [this.normPath(f.filename ?? ''), f.contenido ?? '']));
    const jsByPath  = new Map(jsFiles.map(f => [this.normPath(f.filename ?? ''), f.contenido ?? '']));
    const usedCss   = new Set<string>();
    const usedJs    = new Set<string>();

    let htmlBody = this.normalizarHtmlPreview(
      htmlFile?.contenido ?? '<p style="font-family:sans-serif;padding:20px;color:#888">No hay index.html en el proyecto.</p>'
    );

    const missingRefs: string[] = [];

    htmlBody = htmlBody.replace(/<link[^>]*href=["']([^"']+\.css)["'][^>]*>/gi, (_m, href: string) => {
      const key = this.findFileKey(href, cssByPath);
      if (!key) {
        missingRefs.push(`CSS no encontrado en el proyecto: "${href}"`);
        return '';
      }
      usedCss.add(key);
      return `<style>\n${cssByPath.get(key) ?? ''}\n</style>`;
    });

    htmlBody = htmlBody.replace(/<script[^>]*src=["']([^"']+\.js)["'][^>]*>\s*<\/script>/gi, (_m, src: string) => {
      const key = this.findFileKey(src, jsByPath);
      if (!key) {
        missingRefs.push(`JS no encontrado en el proyecto: "${src}". Revisá que el nombre del archivo coincida con el src.`);
        return '';
      }
      usedJs.add(key);
      return `<script>${jsByPath.get(key) ?? ''}</script>`;
    });

    const extraCss = Array.from(cssByPath.entries()).filter(([k]) => !usedCss.has(k)).map(([, v]) => v).join('\n');
    const extraJs  = Array.from(jsByPath.entries()).filter(([k]) => !usedJs.has(k)).map(([, v]) => v).join('\n');

    const warningsScript = missingRefs.length
      ? `<script>${missingRefs.map(m => `console.warn(${JSON.stringify('[Sandbox] ' + m)});`).join('\n')}</script>`
      : '';

    if (/<\/body>/i.test(htmlBody)) {
      htmlBody = htmlBody.replace(/<\/body>/i, `<script>${this.errorInterceptor()}</script>\n${warningsScript}\n<script>${extraJs}</script>\n</body>`);
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
${warningsScript}
<script>${extraJs}</script>
</body>
</html>`;
  }

  private buildTypescriptContent(): string {
    const htmlFile = this.archivos.find(f => (f.filename ?? '').toLowerCase().endsWith('.html'));
    const cssFiles = this.archivos.filter(f => (f.filename ?? '').toLowerCase().endsWith('.css'));
    const tsFiles  = this.archivos.filter(f => {
      const fn = (f.filename ?? '').toLowerCase();
      return fn.endsWith('.ts') && !fn.endsWith('.spec.ts') && !fn.endsWith('.d.ts');
    });

    const entryNames = ['main.ts', 'index.ts', 'app.ts'];
    const sorted = [
      ...tsFiles.filter(f => !entryNames.includes((f.filename ?? '').toLowerCase().split('/').pop() ?? '')),
      ...tsFiles.filter(f =>  entryNames.includes((f.filename ?? '').toLowerCase().split('/').pop() ?? ''))
    ];

    const tsCode     = sorted.map(f => f.contenido ?? '').join('\n\n');
    const cssContent = cssFiles.map(f => f.contenido ?? '').join('\n');

    // Transpile in the component — no CDN needed in the iframe
    let transpiledJs = '';
    try {
      const result = ts.transpileModule(tsCode, {
        compilerOptions: {
          target: ts.ScriptTarget.ES2020,
          module: ts.ModuleKind.None,
          strict: false,
          experimentalDecorators: true
        }
      });
      transpiledJs = result.outputText;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      this.consoleLines.push({ kind: 'error', msg: `Error TypeScript: ${msg}` });
      this.sandboxErrors.push({ msg: `Error TypeScript: ${msg}` });
      this.cdr.markForCheck();
      return this.buildWebContent();
    }

    let bodyContent = '';
    if (htmlFile) {
      let html = htmlFile.contenido ?? '';
      html = html
        .replace(/<link[^>]*\.css[^>]*>/gi, '')
        .replace(/<script[^>]*src=["'][^"']+\.(?:ts|js)["'][^>]*>\s*<\/script>/gi, '');
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      bodyContent = bodyMatch ? bodyMatch[1].trim() : html;
    }

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.nombreProyecto}</title>
  <style>body{font-family:sans-serif;margin:0;padding:0;box-sizing:border-box}${cssContent}</style>
</head>
<body>
${bodyContent}
<script>
${this.errorInterceptor()}
${this.logInterceptor()}
${transpiledJs}
</script>
</body>
</html>`;
  }

  private buildPythonContent(): string {
    const pyFiles    = this.archivos.filter(f => (f.filename ?? '').toLowerCase().endsWith('.py'));
    const mainFile   = pyFiles.find(f => (f.filename ?? '').toLowerCase().split('/').pop() === 'main.py');
    const activeFile = pyFiles.find(f => f.id === this.archivoActivoId);
    const entryFile  = mainFile ?? activeFile ?? pyFiles[0];

    if (!entryFile) return this.buildWebContent();

    const contenido = this.sanitizarPython(entryFile.contenido ?? '');
    const raw = contenido
      .replace(/\r\n/g, '\n').replace(/\r/g, '\n')
      .split('\n').map(l => l.replace(/\t/g, '    ')).join('\n');
    const pyCode = JSON.stringify(this.dedentPython(raw));

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#020617;color:#cdd6f4;font-family:'Consolas','Courier New',monospace;font-size:13px;padding:16px;min-height:100vh;line-height:1.6}
    #loading{color:#a6e3a1;margin-bottom:12px;animation:pulse 1.2s infinite;font-style:italic}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
    #output{white-space:pre-wrap;word-break:break-word}
    .err{color:#f34d5c}
    .ok{color:#20d77c;font-style:italic;font-size:.85em;display:inline-block}
    .input-recorded{color:#94a3b8}
    #input-line{display:flex;align-items:baseline;font-family:inherit;margin-top:0}
    #input-line[hidden]{display:none}
    #prompt-text{color:#94a3b8;white-space:pre}
    #stdin-input{flex:1;background:transparent;border:none;outline:none;color:#20d77c;font-family:inherit;font-size:inherit;caret-color:#20d77c;padding:0;min-width:50px}
    #stdin-input:disabled{color:#475569}
    body::-webkit-scrollbar{width:6px}
    body::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px}
  </style>
</head>
<body>
  <div id="loading">Loading Python interpreter...</div>
  <div id="output"></div>
  <div id="input-line" hidden><span id="prompt-text"></span><input id="stdin-input" type="text" autocomplete="off" spellcheck="false"></div>
<script>
${this.errorInterceptor()}
window.parent.postMessage({type:'python-loading'},'*');

function appendOutput(text,cls){
  var sp=document.createElement('span');
  if(cls) sp.className=cls;
  sp.textContent=text;
  document.getElementById('output').appendChild(sp);
}
function appendLine(text,cls){
  appendOutput(text,cls);
  document.getElementById('output').appendChild(document.createTextNode('\\n'));
}
function scrollBottom(){window.scrollTo(0,document.body.scrollHeight);}

document.body.addEventListener('click',function(){
  var line=document.getElementById('input-line');
  if(line && !line.hidden){ document.getElementById('stdin-input').focus(); }
});

window.__pyRequestInput=function(promptText){
  return new Promise(function(resolve,reject){
    var inputLine=document.getElementById('input-line');
    var promptEl=document.getElementById('prompt-text');
    var stdinInput=document.getElementById('stdin-input');
    var promptStr=String(promptText==null?'':promptText);
    promptEl.textContent=promptStr;
    inputLine.hidden=false;
    stdinInput.value='';
    stdinInput.disabled=false;
    stdinInput.focus();
    scrollBottom();
    window.parent.postMessage({type:'python-input-needed',prompt:promptStr},'*');
    function cleanup(){
      inputLine.hidden=true;
      stdinInput.disabled=true;
      stdinInput.removeEventListener('keydown',onKey);
      promptEl.textContent='';
    }
    function onKey(e){
      if(e.key==='Enter'){
        e.preventDefault();
        var value=stdinInput.value;
        appendLine(promptStr+value,'input-recorded');
        cleanup();
        window.parent.postMessage({type:'python-input-provided',value:value,prompt:promptStr},'*');
        resolve(value);
      } else if(e.key==='Escape'){
        e.preventDefault();
        appendLine(promptStr+'^D','err');
        cleanup();
        window.parent.postMessage({type:'python-input-eof'},'*');
        reject(new Error('EOF'));
      }
    }
    stdinInput.addEventListener('keydown',onKey);
  });
};

function onPyodideLoadError(){
  var loadingEl=document.getElementById('loading');
  loadingEl.textContent='Error: no se pudo cargar el intérprete Python (CDN inaccesible)';
  loadingEl.style.animation='none';
  loadingEl.style.color='#f34d5c';
  window.parent.postMessage({type:'sandbox-error',msg:'CDN de Pyodide inaccesible. Verificá tu conexión a internet.'},'*');
  window.parent.postMessage({type:'python-ready'},'*');
}

async function runPython(){
  if(typeof loadPyodide==='undefined'){ onPyodideLoadError(); return; }
  var loadingEl=document.getElementById('loading');
  try{
    var pyodide=await loadPyodide({
      indexURL:'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
      stdout:function(t){ appendOutput(t,null); window.parent.postMessage({type:'python-output',msg:t},'*'); },
      stderr:function(t){ appendOutput(t,'err'); window.parent.postMessage({type:'sandbox-error',msg:t},'*'); }
    });
    loadingEl.style.display='none';
    window.parent.postMessage({type:'python-ready'},'*');

    pyodide.runPython('import sys; sys.modules["micropip"]=type(sys)("micropip_blocked")');

    await pyodide.runPythonAsync(\`
import js as _js
import builtins as _bi

async def __ainput(prompt=''):
    try:
        return await _js.__pyRequestInput(str(prompt))
    except Exception:
        raise EOFError('Entrada cancelada por el usuario') from None

def __input_indirecto(*args, **kwargs):
    raise RuntimeError("Llamar a input() de forma indirecta (alias, variable, decorator) no está soportado en el sandbox web. Llamalo directamente: input('prompt').")

_bi.input = __input_indirecto
\`);

    pyodide.globals.set('__raw_user_code', ${pyCode});
    var transformedCode;
    try{
      transformedCode = pyodide.runPython(\`
import ast as _ast

class _InputAwaiter(_ast.NodeTransformer):
    def visit_Call(self, node):
        self.generic_visit(node)
        if isinstance(node.func, _ast.Name) and node.func.id == 'input':
            return _ast.Await(value=_ast.Call(
                func=_ast.Name(id='__ainput', ctx=_ast.Load()),
                args=node.args,
                keywords=node.keywords,
            ))
        return node

_tree = _ast.parse(__raw_user_code, mode='exec')
_tree = _InputAwaiter().visit(_tree)
_ast.fix_missing_locations(_tree)
_ast.unparse(_tree)
\`);
    }catch(e){
      var pmsg=String(e.message||e);
      appendLine(pmsg,'err');
      window.parent.postMessage({type:'sandbox-error',msg:pmsg},'*');
      return;
    }

    try{
      await pyodide.runPythonAsync(transformedCode);
      var out=document.getElementById('output');
      if(!out.textContent.trim()){
        appendOutput('(sin salida)','ok');
        window.parent.postMessage({type:'python-output',msg:'(sin salida)'},'*');
      }
    }catch(e){
      var emsg=String(e.message||e);
      appendLine(emsg,'err');
      window.parent.postMessage({type:'sandbox-error',msg:emsg},'*');
    }
  }catch(e){
    loadingEl.textContent='Error al cargar Python: '+e.message;
    loadingEl.style.animation='none';
    loadingEl.style.color='#f34d5c';
    window.parent.postMessage({type:'sandbox-error',msg:'Error cargando Python: '+e.message},'*');
    window.parent.postMessage({type:'python-ready'},'*');
  }
}
</script>
<script src="https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js"
        onload="runPython()"
        onerror="onPyodideLoadError()"></script>
</body>
</html>`;
  }

  private sanitizarPython(raw: string): string {
    let content = raw;
    content = content.replace(/^\s*```(?:python|py)?[ \t]*\r?\n/i, '');
    content = content.replace(/\r?\n[ \t]*```\s*$/g, '');
    content = content.replace(/ /g, ' ');
    content = content.replace(/[​-‍﻿]/g, '');
    content = content.replace(/[‘’‛]/g, "'");
    content = content.replace(/[“”‟]/g, '"');
    return content;
  }


  private dedentPython(code: string): string {
    const lines = code.split('\n');
    const nonEmpty = lines.filter(l => l.trim().length > 0);
    if (nonEmpty.length === 0) return code;
    const minSpaces = Math.min(...nonEmpty.map(l => l.match(/^ */)?.[0].length ?? 0));
    if (minSpaces === 0) return code;
    const pad = ' '.repeat(minSpaces);
    return lines.map(l => l.startsWith(pad) ? l.slice(minSpaces) : l).join('\n');
  }

  private logInterceptor(): string {
    return `const _cl=console.log.bind(console);
console.log=function(){
  _cl.apply(console,arguments);
  window.parent.postMessage({type:'console-log',msg:Array.from(arguments).map(function(a){
    return typeof a==='object'?JSON.stringify(a,null,2):String(a);
  }).join(' ')},'*');
};`;
  }

  private startPythonTimeout() {
    this.clearPythonTimeout();
    this.pythonTimeoutId = setTimeout(() => {
      if (!this.isLoading) return;
      this.isLoading = false;
      const msg = 'Timeout: la ejecución superó 60 segundos y fue cancelada.';
      this.consoleLines.push({ kind: 'error', msg });
      this.sandboxErrors.push({ msg });
      const iframe = this.previewFrameRef?.nativeElement;
      if (iframe) iframe.src = 'about:blank';
      this.cdr.markForCheck();
    }, 60_000);
  }

  private clearPythonTimeout() {
    if (this.pythonTimeoutId !== null) {
      clearTimeout(this.pythonTimeoutId);
      this.pythonTimeoutId = null;
    }
  }

  private seleccionarArchivoHtml(archivoActivo?: DiarioDto): DiarioDto | undefined {
    const esHtml = (f: DiarioDto) => {
      const name = (f.filename ?? '').toLowerCase();
      const raw  = (f.contenido ?? '').trim();
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
    const clean  = this.normPath(importPath).split('?')[0].split('#')[0];
    if (store.has(clean)) return clean;

    const withoutLeadingDots = clean.replace(/^(\.\/|\.\.\/)+/, '');
    if (store.has(withoutLeadingDots)) return withoutLeadingDots;

    const byName = withoutLeadingDots.split('/').pop() ?? withoutLeadingDots;
    for (const key of store.keys()) {
      if (key.endsWith(`/${byName}`) || key === byName) return key;
    }

    if (store.size === 1) {
      const onlyKey = store.keys().next().value;
      return onlyKey ?? null;
    }

    return null;
  }

  private errorInterceptor(): string {
    return `window.onerror=function(msg,src,line,col){window.parent.postMessage({type:'sandbox-error',msg:String(msg),line:line,col:col},'*');};
const _ce=console.error.bind(console);
console.error=function(){_ce.apply(console,arguments);window.parent.postMessage({type:'console-error',args:Array.from(arguments).map(String)},'*');};`;
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
    content = content.replace(/^```(?:html)?\s*[\r\n]+/i, '').replace(/[\r\n]+```$/, '');
    // Decode HTML entities without using innerHTML
    if (!/<[a-z!][\s\S]*>/i.test(content) && /&lt;\/?[a-z]/i.test(content)) {
      content = content
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'");
    }
    return content;
  }
}
