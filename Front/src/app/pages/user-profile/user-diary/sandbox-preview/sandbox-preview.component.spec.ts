import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { SandboxPreviewComponent } from './sandbox-preview.component';
import { DiarioDto } from 'src/app/core/models/models';
import { getCommonTestProviders } from '../../../../testing/test-utils';
import { ModalController } from '@ionic/angular/standalone';

/**
 * Deep Dive: SandboxPreviewComponent — Preview de proyectos web en iframe.
 *
 * El componente recibe @Input() archivos[] y construye un HTML combinado para
 * renderizar dentro de un iframe via object URL.
 *
 * En tests no hay DOM real (no hay iframe), así que:
 * - Testeamos la lógica de buildSandboxContent() a través de sandboxContent.
 * - El renderInIframe() requiere nativeElement del @ViewChild — en tests no
 *   existe, así que solo verificamos que no lanza errores.
 * - ModalController se mockea para cerrar correctamente.
 */
describe('SandboxPreviewComponent', () => {
  let component: SandboxPreviewComponent;
  let fixture: ComponentFixture<SandboxPreviewComponent>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;

  const HTML_ARCHIVO: DiarioDto = {
    id: 1,
    contenido: '<!DOCTYPE html><html><head></head><body><h1>Test</h1></body></html>',
    visibilidad: 'PRIVADO',
    fechaCreacion: '2026-01-01',
    usuarioNombre: 'Test User',
    temaTitulo: 'Proyecto Test',
    tipo: 'FILE',
    filename: 'index.html'
  };

  const CSS_ARCHIVO: DiarioDto = {
    id: 2,
    contenido: 'body { background: red; }',
    visibilidad: 'PRIVADO',
    fechaCreacion: '2026-01-01',
    usuarioNombre: 'Test User',
    temaTitulo: 'Proyecto Test',
    tipo: 'FILE',
    filename: 'style.css'
  };

  const JS_ARCHIVO: DiarioDto = {
    id: 3,
    contenido: 'console.log("hello");',
    visibilidad: 'PRIVADO',
    fechaCreacion: '2026-01-01',
    usuarioNombre: 'Test User',
    temaTitulo: 'Proyecto Test',
    tipo: 'FILE',
    filename: 'script.js'
  };

  beforeEach(async () => {
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    modalCtrlSpy.dismiss.and.returnValue(Promise.resolve(true));

    await TestBed.configureTestingModule({
      imports: [SandboxPreviewComponent],
      providers: [
        ...getCommonTestProviders(),
        { provide: ModalController, useValue: modalCtrlSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SandboxPreviewComponent);
    component = fixture.componentInstance;
  });

  // ─── Creación ─────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ─── Input vacío ──────────────────────────────────────────────────────────

  it('con archivos vacíos, ngOnInit no lanza errores y sandboxContent tiene estructura mínima', () => {
    component.archivos = [];
    component.nombreProyecto = 'Mi Proyecto';

    expect(() => fixture.detectChanges()).not.toThrow();
    // Debe contener al menos la etiqueta <html> del template por defecto
    expect(component.sandboxContent).toContain('<html');
  });

  it('con archivos vacíos, sandboxErrors arranca como array vacío', () => {
    component.archivos = [];
    fixture.detectChanges();
    expect(component.sandboxErrors).toEqual([]);
  });

  // ─── Input con HTML válido ─────────────────────────────────────────────────

  it('con archivo HTML, sandboxContent incluye el contenido del HTML', () => {
    component.archivos = [HTML_ARCHIVO];
    component.archivoActivoId = HTML_ARCHIVO.id;
    component.nombreProyecto = 'Proyecto Test';

    fixture.detectChanges();

    expect(component.sandboxContent).toContain('<h1>Test</h1>');
  });

  it('con archivo CSS referenciado en HTML, lo incrusta como <style>', () => {
    const htmlConLink: DiarioDto = {
      ...HTML_ARCHIVO,
      contenido: '<!DOCTYPE html><html><head><link rel="stylesheet" href="style.css"></head><body></body></html>'
    };
    component.archivos = [htmlConLink, CSS_ARCHIVO];
    component.archivoActivoId = htmlConLink.id;

    fixture.detectChanges();

    expect(component.sandboxContent).toContain('background: red');
  });

  it('con archivo JS referenciado en HTML, lo incrusta como <script>', () => {
    const htmlConScript: DiarioDto = {
      ...HTML_ARCHIVO,
      contenido: '<!DOCTYPE html><html><head></head><body><script src="script.js"></script></body></html>'
    };
    component.archivos = [htmlConScript, JS_ARCHIVO];
    component.archivoActivoId = htmlConScript.id;

    fixture.detectChanges();

    expect(component.sandboxContent).toContain('console.log');
  });

  // ─── onSandboxMessage ─────────────────────────────────────────────────────

  it('onSandboxMessage agrega errores de tipo "sandbox-error" a sandboxErrors', () => {
    fixture.detectChanges();
    const event = new MessageEvent('message', {
      data: { type: 'sandbox-error', msg: 'ReferenceError: x is not defined', line: 5, col: 3 }
    });

    component.onSandboxMessage(event);

    expect(component.sandboxErrors.length).toBe(1);
    expect(component.sandboxErrors[0].msg).toBe('ReferenceError: x is not defined');
    expect(component.sandboxErrors[0].line).toBe(5);
  });

  it('onSandboxMessage agrega errores de tipo "console-error" a sandboxErrors', () => {
    fixture.detectChanges();
    const event = new MessageEvent('message', {
      data: { type: 'console-error', args: ['Error en consola'] }
    });

    component.onSandboxMessage(event);

    expect(component.sandboxErrors.length).toBe(1);
    expect(component.sandboxErrors[0].msg).toBe('Error en consola');
  });

  it('onSandboxMessage ignora mensajes de tipo desconocido', () => {
    fixture.detectChanges();
    const event = new MessageEvent('message', {
      data: { type: 'otro-tipo', msg: 'ignorar' }
    });

    component.onSandboxMessage(event);

    expect(component.sandboxErrors.length).toBe(0);
  });

  // ─── cerrar ───────────────────────────────────────────────────────────────

  it('cerrar() llama a modalCtrl.dismiss()', () => {
    fixture.detectChanges();
    component.cerrar();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalled();
  });

  // ─── recargar ─────────────────────────────────────────────────────────────

  it('recargar() limpia sandboxErrors', () => {
    fixture.detectChanges();
    component.sandboxErrors = [{ msg: 'Error previo', line: 1 }];

    component.recargar();

    expect(component.sandboxErrors).toEqual([]);
  });
});
