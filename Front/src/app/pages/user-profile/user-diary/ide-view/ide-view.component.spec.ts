import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { IdeViewComponent } from './ide-view.component';
import { DiarioService } from 'src/app/services/diario.service';
import { DiarioDto, DiarioTemaDto } from 'src/app/core/models/models';
import { getCommonTestProviders } from '../../../../testing/test-utils';
import { of, throwError } from 'rxjs';
import { AlertController, ToastController, ModalController } from '@ionic/angular/standalone';

/**
 * Deep Dive: IdeViewComponent — Editor de archivos del IDE.
 *
 * El componente usa AlertController de Ionic para crear/borrar archivos,
 * por lo que mockeamos alertCtrl con un spy que simula el flujo de confirmación.
 * Monaco Editor se ignora completamente (no existe en el entorno de tests);
 * testeamos la lógica de estado sin el editor visual.
 *
 * Estrategia:
 * - crearArchivo(): función privada — testeada a través de crearNuevoArchivo() + spy de alertCtrl
 * - guardarArchivo(): accesible público — testeada directamente
 * - borrarArchivo(): testeada con spy de alertCtrl que simula confirmación
 * - seleccionarArchivo(): accesible público
 */
describe('IdeViewComponent', () => {
  let component: IdeViewComponent;
  let fixture: ComponentFixture<IdeViewComponent>;
  let diarioServiceSpy: jasmine.SpyObj<DiarioService>;
  let alertCtrlSpy: jasmine.SpyObj<AlertController>;
  let toastCtrlSpy: jasmine.SpyObj<ToastController>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;

  const MOCK_TEMA: DiarioTemaDto = {
    id: 42,
    titulo: 'Proyecto Test',
    descripcion: 'Desc test',
    usuarioId: 1,
    visibilidad: 'PRIVADO' as any
  };

  const MOCK_ARCHIVO_1: DiarioDto = {
    id: 1,
    contenido: '<h1>Hola</h1>',
    visibilidad: 'PRIVADO',
    fechaCreacion: '2026-01-01T10:00:00',
    usuarioNombre: 'Test User',
    temaTitulo: 'Proyecto Test',
    tipo: 'FILE',
    filename: 'index.html'
  };

  const MOCK_ARCHIVO_2: DiarioDto = {
    id: 2,
    contenido: 'body { margin: 0; }',
    visibilidad: 'PRIVADO',
    fechaCreacion: '2026-01-02T10:00:00',
    usuarioNombre: 'Test User',
    temaTitulo: 'Proyecto Test',
    tipo: 'FILE',
    filename: 'style.css'
  };

  // Helper: crea un spy de Alert que invoca el handler del botón en la posición indicada
  function crearAlertMockConHandler(handlerIndex: number, handlerData?: any): jasmine.SpyObj<HTMLIonAlertElement> {
    const alertElementSpy = jasmine.createSpyObj<HTMLIonAlertElement>('IonAlert', ['present', 'dismiss']);
    alertElementSpy.present.and.returnValue(Promise.resolve());
    alertCtrlSpy.create.and.callFake(async (opts: any) => {
      const handler = opts.buttons?.[handlerIndex]?.handler;
      if (handler) handler(handlerData ?? {});
      return alertElementSpy;
    });
    return alertElementSpy;
  }

  beforeEach(async () => {
    diarioServiceSpy = jasmine.createSpyObj('DiarioService', [
      'getArchivosActuales',
      'getMisEntradas',
      'crearArchivoIDE',
      'actualizarEntrada',
      'borrarEntrada',
      'getColaboradores',
      'invitarColaborador',
      'getComentarios',
      'getComentariosTema',
      'agregarComentarioTema',
      'analizarProyecto',
      'codeReview',
      'sugerirEtiquetas',
      'resumirTema',
      'exportarTemaCsv',
      'crearEntrada',
      'extraerCodigoDeImagen',
    ]);

    // Defaults: cargar archivos retorna lista de archivos mock
    diarioServiceSpy.getArchivosActuales.and.returnValue(of([MOCK_ARCHIVO_1, MOCK_ARCHIVO_2]));
    diarioServiceSpy.getMisEntradas.and.returnValue(of({ content: [] }));
    diarioServiceSpy.getColaboradores.and.returnValue(of([]));
    diarioServiceSpy.getComentariosTema.and.returnValue(of([]));
    diarioServiceSpy.actualizarEntrada.and.returnValue(of({} as any));
    diarioServiceSpy.borrarEntrada.and.returnValue(of(void 0 as any));

    const toastElementSpy = jasmine.createSpyObj('IonToast', ['present']);
    toastElementSpy.present.and.returnValue(Promise.resolve());
    toastCtrlSpy = jasmine.createSpyObj('ToastController', ['create']);
    toastCtrlSpy.create.and.returnValue(Promise.resolve(toastElementSpy));

    alertCtrlSpy = jasmine.createSpyObj('AlertController', ['create']);
    const defaultAlertSpy = jasmine.createSpyObj<HTMLIonAlertElement>('IonAlert', ['present', 'dismiss']);
    defaultAlertSpy.present.and.returnValue(Promise.resolve());
    alertCtrlSpy.create.and.returnValue(Promise.resolve(defaultAlertSpy));

    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['create', 'dismiss']);
    const modalSpy = jasmine.createSpyObj('IonModal', ['present', 'dismiss']);
    modalSpy.present.and.returnValue(Promise.resolve());
    modalCtrlSpy.create.and.returnValue(Promise.resolve(modalSpy));

    await TestBed.configureTestingModule({
      imports: [IdeViewComponent],
      providers: [
        ...getCommonTestProviders(),
        { provide: DiarioService, useValue: diarioServiceSpy },
        { provide: AlertController, useValue: alertCtrlSpy },
        { provide: ToastController, useValue: toastCtrlSpy },
        { provide: ModalController, useValue: modalCtrlSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(IdeViewComponent);
    component = fixture.componentInstance;
    component.tema = MOCK_TEMA;
  });

  // ─── Creación ──────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ─── ngOnInit carga archivos ───────────────────────────────────────────────

  it('ngOnInit llama a cargarArchivos y popula la lista', () => {
    fixture.detectChanges(); // dispara ngOnInit
    expect(diarioServiceSpy.getArchivosActuales).toHaveBeenCalledWith(MOCK_TEMA.id);
    expect(component.archivos.length).toBe(2);
  });

  it('ngOnInit selecciona el primer archivo como activo', () => {
    fixture.detectChanges();
    // El archivo activo debe tener el filename del primero (normalizado)
    expect(component.archivoActivo).not.toBeNull();
    expect(component.archivoActivo?.filename).toBe('index.html');
  });

  // ─── seleccionarArchivo ────────────────────────────────────────────────────

  it('seleccionarArchivo actualiza archivoActivo y contenidoEditor', () => {
    fixture.detectChanges();
    component.seleccionarArchivo(MOCK_ARCHIVO_2);

    expect(component.archivoActivo?.filename).toBe('style.css');
    expect(component.contenidoEditor).toBe('body { margin: 0; }');
  });

  it('seleccionarArchivo resetea tienesCambios a false', () => {
    fixture.detectChanges();
    component.tienesCambios = true;
    component.seleccionarArchivo(MOCK_ARCHIVO_2);

    expect(component.tienesCambios).toBeFalse();
  });

  // ─── guardarArchivo ────────────────────────────────────────────────────────

  it('guardarArchivo llama a diarioService.actualizarEntrada con el contenido actual', () => {
    fixture.detectChanges();
    component.archivoActivo = MOCK_ARCHIVO_1;
    component.contenidoEditor = '<h1>Modificado</h1>';
    component.tienesCambios = true;

    component.guardarArchivo();

    expect(diarioServiceSpy.actualizarEntrada).toHaveBeenCalledWith(
      MOCK_ARCHIVO_1.id,
      '<h1>Modificado</h1>',
      'PRIVADO',
      MOCK_TEMA.id
    );
  });

  it('guardarArchivo NO llama al servicio si readOnly=true', () => {
    fixture.detectChanges();
    component.readOnly = true;
    component.archivoActivo = MOCK_ARCHIVO_1;
    component.tienesCambios = true;

    component.guardarArchivo();

    expect(diarioServiceSpy.actualizarEntrada).not.toHaveBeenCalled();
  });

  it('guardarArchivo NO llama al servicio si no hay cambios', () => {
    fixture.detectChanges();
    component.archivoActivo = MOCK_ARCHIVO_1;
    component.tienesCambios = false;

    component.guardarArchivo();

    expect(diarioServiceSpy.actualizarEntrada).not.toHaveBeenCalled();
  });

  it('guardarArchivo NO llama al servicio si no hay archivoActivo', () => {
    fixture.detectChanges();
    component.archivoActivo = null;
    component.tienesCambios = true;

    component.guardarArchivo();

    expect(diarioServiceSpy.actualizarEntrada).not.toHaveBeenCalled();
  });

  // ─── crearNuevoArchivo (a través de AlertController) ─────────────────────

  it('crearNuevoArchivo: con nombre válido llama a diarioService.crearArchivoIDE', fakeAsync(async () => {
    fixture.detectChanges();
    const nuevoArchivo: DiarioDto = {
      id: 99, contenido: '', visibilidad: 'PRIVADO',
      fechaCreacion: '2026-01-01', usuarioNombre: 'Test User',
      temaTitulo: 'Proyecto Test', tipo: 'FILE', filename: 'app.js'
    };
    diarioServiceSpy.crearArchivoIDE = jasmine.createSpy().and.returnValue(of(nuevoArchivo));

    // Simular que el usuario confirma con nombre "app.js"
    crearAlertMockConHandler(1, { filename: 'app.js' });

    await component.crearNuevoArchivo();
    tick();

    expect(diarioServiceSpy.crearArchivoIDE).toHaveBeenCalledWith(
      MOCK_TEMA.id,
      'app.js',
      jasmine.any(String)
    );
  }));

  it('crearNuevoArchivo: con nombre vacío NO llama al servicio (handler devuelve false)', fakeAsync(async () => {
    fixture.detectChanges();
    diarioServiceSpy.crearArchivoIDE = jasmine.createSpy().and.returnValue(of({} as any));

    // Simular que el usuario confirma con nombre vacío
    crearAlertMockConHandler(1, { filename: '' });

    await component.crearNuevoArchivo();
    tick();

    expect(diarioServiceSpy.crearArchivoIDE).not.toHaveBeenCalled();
  }));

  // ─── borrarArchivo (a través de AlertController) ──────────────────────────

  it('borrarArchivo: con confirmación llama a diarioService.borrarEntrada', fakeAsync(async () => {
    fixture.detectChanges();
    // Simular confirmación: handler en índice 1 (botón "Eliminar")
    crearAlertMockConHandler(1);

    await component.borrarArchivo(MOCK_ARCHIVO_2);
    tick();

    expect(diarioServiceSpy.borrarEntrada).toHaveBeenCalledWith(MOCK_ARCHIVO_2.id);
  }));

  it('borrarArchivo: con cancelar (índice 0) NO llama al servicio', fakeAsync(async () => {
    fixture.detectChanges();
    // Simular cancelación: handler en índice 0 (botón "Cancelar" con role cancel)
    const alertElementSpy = jasmine.createSpyObj<HTMLIonAlertElement>('IonAlert', ['present', 'dismiss']);
    alertElementSpy.present.and.returnValue(Promise.resolve());
    alertCtrlSpy.create.and.returnValue(Promise.resolve(alertElementSpy));

    await component.borrarArchivo(MOCK_ARCHIVO_1);
    tick();

    expect(diarioServiceSpy.borrarEntrada).not.toHaveBeenCalled();
  }));

  // ─── onEditorChange ────────────────────────────────────────────────────────

  it('onEditorChange marca tienesCambios cuando el contenido difiere', () => {
    fixture.detectChanges();
    component.archivoActivo = MOCK_ARCHIVO_1;
    component.contenidoEditor = MOCK_ARCHIVO_1.contenido ?? '';

    component.onEditorChange('<h1>Nuevo</h1>');

    expect(component.tienesCambios).toBeTrue();
    expect(component.contenidoEditor).toBe('<h1>Nuevo</h1>');
  });

  it('onEditorChange NO marca tienesCambios si el contenido es idéntico', () => {
    fixture.detectChanges();
    component.archivoActivo = MOCK_ARCHIVO_1;
    const originalContent = MOCK_ARCHIVO_1.contenido ?? '';
    component.contenidoEditor = originalContent;

    component.onEditorChange(originalContent);

    expect(component.tienesCambios).toBeFalse();
  });

  // ─── getLenguaje ────────────────────────────────────────────────────────────

  it('getLenguaje retorna "html" para archivos .html', () => {
    expect(component.getLenguaje('index.html')).toBe('html');
  });

  it('getLenguaje retorna "javascript" para archivos .js', () => {
    expect(component.getLenguaje('script.js')).toBe('javascript');
  });

  it('getLenguaje retorna "plaintext" para extensiones desconocidas', () => {
    expect(component.getLenguaje('archivo.xyz')).toBe('plaintext');
  });

  // ─── toggleCommitLogPanel ──────────────────────────────────────────────────

  it('toggleCommitLogPanel alterna entre "commits" y "none"', () => {
    fixture.detectChanges();
    expect(component.panelInferior).toBe('none');

    component.toggleCommitLogPanel();
    expect(component.panelInferior).toBe('commits');

    component.toggleCommitLogPanel();
    expect(component.panelInferior).toBe('none');
  });

  // ─── permiteGestionCommits ────────────────────────────────────────────────

  it('permiteGestionCommits es true cuando no es readOnly ni staffFeedbackMode', () => {
    component.readOnly = false;
    component.staffFeedbackMode = false;
    expect(component.permiteGestionCommits).toBeTrue();
  });

  it('permiteGestionCommits es false cuando readOnly=true', () => {
    component.readOnly = true;
    component.staffFeedbackMode = false;
    expect(component.permiteGestionCommits).toBeFalse();
  });

  // ─── readOnly: panel inicial ───────────────────────────────────────────────

  it('con readOnly=true, ngOnInit pone panelInferior="feedback"', () => {
    component.readOnly = true;
    fixture.detectChanges();
    expect(component.panelInferior).toBe('feedback');
  });

  // ─── getLineCount ──────────────────────────────────────────────────────────

  it('getLineCount devuelve el número de líneas del contenido actual', () => {
    component.contenidoEditor = 'linea1\nlinea2\nlinea3';
    expect(component.getLineCount()).toBe(3);
  });
});
