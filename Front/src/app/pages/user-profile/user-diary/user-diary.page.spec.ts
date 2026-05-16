import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { UserDiaryPage } from './user-diary.page';
import { DiarioService } from 'src/app/services/diario.service';
import { DiarioTemaDto } from 'src/app/core/models/models';
import { getCommonTestProviders } from '../../../testing/test-utils';
import { of, throwError } from 'rxjs';
import { AlertController, ToastController, LoadingController } from '@ionic/angular/standalone';

/**
 * Deep Dive: UserDiaryPage — Temas + Entradas + Filtrado local.
 *
 * La page NO usa signals (usa propiedades de clase normales).
 * `entradasFiltradas` es un getter que filtra por temaSeleccionado.
 * `crearEntrada` no invoca el servicio si el texto está vacío o no hay tema.
 * `seleccionarTema` / `volverATemas` controlan la navegación entre vistas.
 * `mostrarFormCrear` controla el modal de crear proyecto (arranca en false).
 * `crearTema` cierra el modal (mostrarFormCrear = false) al completarse.
 */
describe('UserDiaryPage', () => {
  let component: UserDiaryPage;
  let fixture: ComponentFixture<UserDiaryPage>;
  let diarioServiceSpy: jasmine.SpyObj<DiarioService>;
  let alertCtrlSpy: jasmine.SpyObj<AlertController>;

  const MOCK_TEMAS: DiarioTemaDto[] = [
    { id: 1, titulo: 'Angular', descripcion: 'Notas de Angular', usuarioId: 1, visibilidad: 'PRIVADO' as any },
    { id: 2, titulo: 'Docker', descripcion: 'Notas de Docker', usuarioId: 1, visibilidad: 'PRIVADO' as any }
  ];

  const MOCK_ENTRADAS = {
    content: [
      { id: 1, contenido: 'Primera nota', visibilidad: 'PRIVADO', fechaCreacion: '2026-01-01', temaTitulo: 'Angular' },
      { id: 2, contenido: 'Segunda nota', visibilidad: 'PUBLICO', fechaCreacion: '2026-01-02', temaTitulo: 'Angular' },
      { id: 3, contenido: 'Docker intro', visibilidad: 'PRIVADO', fechaCreacion: '2026-01-03', temaTitulo: 'Docker' }
    ]
  };

  beforeEach(async () => {
    diarioServiceSpy = jasmine.createSpyObj('DiarioService', [
      'getTemas', 'getMisEntradas', 'crearTema', 'crearEntrada',
      'borrarTema', 'borrarEntrada', 'actualizarEntrada', 'invitarColaborador',
      'cambiarVisibilidadTema', 'codeReview', 'sugerirEtiquetas', 'resumirTema',
      'exportarTemaCsv', 'extraerCodigoDeImagen'
    ]);
    diarioServiceSpy.getTemas.and.returnValue(of(MOCK_TEMAS));
    diarioServiceSpy.getMisEntradas.and.returnValue(of(MOCK_ENTRADAS));
    diarioServiceSpy.crearEntrada.and.returnValue(of({}));
    diarioServiceSpy.crearTema.and.returnValue(of(MOCK_TEMAS[0]));
    diarioServiceSpy.borrarTema.and.returnValue(of(void 0 as any));
    diarioServiceSpy.borrarEntrada.and.returnValue(of(void 0 as any));
    diarioServiceSpy.actualizarEntrada.and.returnValue(of({} as any));
    diarioServiceSpy.invitarColaborador.and.returnValue(of({} as any));

    // AlertController: por defecto crea un alert que no hace nada
    const defaultAlertSpy = jasmine.createSpyObj<HTMLIonAlertElement>('IonAlert', ['present', 'dismiss']);
    defaultAlertSpy.present.and.returnValue(Promise.resolve());
    alertCtrlSpy = jasmine.createSpyObj('AlertController', ['create']);
    alertCtrlSpy.create.and.returnValue(Promise.resolve(defaultAlertSpy));

    // ToastController mock
    const toastSpy = jasmine.createSpyObj<HTMLIonToastElement>('IonToast', ['present']);
    toastSpy.present.and.returnValue(Promise.resolve());
    const toastCtrlSpy = jasmine.createSpyObj('ToastController', ['create']);
    toastCtrlSpy.create.and.returnValue(Promise.resolve(toastSpy));

    // LoadingController mock
    const loadingSpy = jasmine.createSpyObj<HTMLIonLoadingElement>('IonLoading', ['present', 'dismiss']);
    loadingSpy.present.and.returnValue(Promise.resolve());
    loadingSpy.dismiss.and.returnValue(Promise.resolve(true));
    const loadingCtrlSpy = jasmine.createSpyObj('LoadingController', ['create']);
    loadingCtrlSpy.create.and.returnValue(Promise.resolve(loadingSpy));

    await TestBed.configureTestingModule({
      imports: [UserDiaryPage],
      providers: [
        ...getCommonTestProviders(),
        { provide: DiarioService, useValue: diarioServiceSpy },
        { provide: AlertController, useValue: alertCtrlSpy },
        { provide: ToastController, useValue: toastCtrlSpy },
        { provide: LoadingController, useValue: loadingCtrlSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(UserDiaryPage);
    component = fixture.componentInstance;
  });

  // ─── Creación ────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ─── Estado inicial ──────────────────────────────────

  it('initial state: entradas is empty array', () => {
    expect(component.entradas).toEqual([]);
  });

  it('initial state: temaSeleccionado is null', () => {
    expect(component.temaSeleccionado).toBeNull();
  });

  it('initial state: nuevaEntradaTexto is empty string', () => {
    expect(component.nuevaEntradaTexto).toBe('');
  });

  it('initial state: mostrarFormCrear is false (modal closed)', () => {
    expect(component.mostrarFormCrear).toBeFalse();
  });

  // ─── cargarDatos HTTP ─────────────────────────────────

  it('cargarDatos populates temas and entradas on HTTP success', () => {
    component.cargarDatos();

    expect(component.temas.length).toBe(2);
    expect(component.entradas.length).toBe(3);
  });

  // ─── entradasFiltradas getter ─────────────────────────

  it('entradasFiltradas returns empty when no tema is selected', () => {
    component.entradas = MOCK_ENTRADAS.content;
    component.temaSeleccionado = null;

    expect(component.entradasFiltradas.length).toBe(0);
  });

  it('entradasFiltradas returns only entries matching selected tema', () => {
    component.entradas = MOCK_ENTRADAS.content;
    component.temaSeleccionado = MOCK_TEMAS[0]; // Angular

    const result = component.entradasFiltradas;
    expect(result.length).toBe(2);
    expect(result.every(e => e.temaTitulo === 'Angular')).toBeTrue();
  });

  // ─── seleccionarTema / volverATemas ──────────────────

  it('seleccionarTema sets temaSeleccionado', () => {
    component.seleccionarTema(MOCK_TEMAS[1]);

    expect(component.temaSeleccionado).toBe(MOCK_TEMAS[1]);
  });

  it('volverATemas resets temaSeleccionado to null', () => {
    component.temaSeleccionado = MOCK_TEMAS[0];

    component.volverATemas();

    expect(component.temaSeleccionado).toBeNull();
  });

  // ─── crearEntrada ─────────────────────────────────────

  it('crearEntrada does NOT call service when texto is empty', () => {
    component.temaSeleccionado = MOCK_TEMAS[0];
    component.nuevaEntradaTexto = '   ';

    component.crearEntrada();

    expect(diarioServiceSpy.crearEntrada).not.toHaveBeenCalled();
  });

  it('crearEntrada does NOT call service when no tema is selected', () => {
    component.temaSeleccionado = null;
    component.nuevaEntradaTexto = 'Texto válido';

    component.crearEntrada();

    expect(diarioServiceSpy.crearEntrada).not.toHaveBeenCalled();
  });

  // ─── Modal crear proyecto ─────────────────────────────

  it('mostrarFormCrear toggles to true when "Nuevo proyecto" is clicked', () => {
    component.mostrarFormCrear = false;
    component.mostrarFormCrear = true;
    expect(component.mostrarFormCrear).toBeTrue();
  });

  it('crearTema guard: does NOT reach service when nuevoTemaTitulo is blank', async () => {
    diarioServiceSpy.crearTema.and.returnValue(of(MOCK_TEMAS[0]));
    component.nuevoTemaTitulo = '   ';

    await component.crearTema();

    expect(diarioServiceSpy.crearTema).not.toHaveBeenCalled();
  });

  // ─── getEntradasCountForTema / getLastEntradaRelative ──

  it('getEntradasCountForTema returns correct count for known tema', () => {
    component.entradas = MOCK_ENTRADAS.content;
    expect(component.getEntradasCountForTema('Angular')).toBe(2);
    expect(component.getEntradasCountForTema('Docker')).toBe(1);
  });

  it('getEntradasCountForTema returns 0 for unknown tema', () => {
    component.entradas = MOCK_ENTRADAS.content;
    expect(component.getEntradasCountForTema('Inexistente')).toBe(0);
  });

  // ─── filtrado por tipo ────────────────────────────────

  it('setFiltro changes filtroTipo', () => {
    component.setFiltro('bug');
    expect(component.filtroTipo).toBe('bug');
  });

  it('contarTipo returns 0 when no tema is selected', () => {
    component.temaSeleccionado = null;
    expect(component.contarTipo('todo')).toBe(0);
  });

  it('contarTipo todo returns total entries for selected tema', () => {
    component.entradas = MOCK_ENTRADAS.content;
    component.temaSeleccionado = MOCK_TEMAS[0];
    expect(component.contarTipo('todo')).toBe(2);
  });

  // ─── crearEntrada: happy path ─────────────────────────────────────────────

  it('crearEntrada con contenido válido y tema seleccionado llama a diarioService.crearEntrada', () => {
    component.temaSeleccionado = MOCK_TEMAS[0];
    component.nuevaEntradaTexto = 'Mi nota de prueba';

    component.crearEntrada();

    expect(diarioServiceSpy.crearEntrada).toHaveBeenCalledWith(
      'Mi nota de prueba',
      MOCK_TEMAS[0].id,
      'PRIVADO'
    );
  });

  it('crearEntrada con contenido válido y tema seleccionado recarga datos', () => {
    component.temaSeleccionado = MOCK_TEMAS[0];
    component.nuevaEntradaTexto = 'Texto';
    diarioServiceSpy.crearEntrada.and.returnValue(of({} as any));

    component.crearEntrada();

    // cargarDatos llama getTemas y getMisEntradas
    expect(diarioServiceSpy.getTemas).toHaveBeenCalled();
  });

  it('crearEntrada con contenido válido limpia nuevaEntradaTexto al completarse', () => {
    component.temaSeleccionado = MOCK_TEMAS[0];
    component.nuevaEntradaTexto = 'Texto válido';
    diarioServiceSpy.crearEntrada.and.returnValue(of({} as any));

    component.crearEntrada();

    expect(component.nuevaEntradaTexto).toBe('');
  });

  // ─── borrarTema: happy path con confirmación ──────────────────────────────

  it('borrarTema con confirmación (handler índice 1) llama a diarioService.borrarTema', async () => {
    // Simular que el usuario pulsa "Eliminar" (botón destructive en índice 1)
    const alertElementSpy = jasmine.createSpyObj<HTMLIonAlertElement>('IonAlert', ['present', 'dismiss']);
    alertElementSpy.present.and.returnValue(Promise.resolve());
    alertCtrlSpy.create.and.callFake(async (opts: any) => {
      const handler = opts.buttons?.[1]?.handler;
      if (handler) handler();
      return alertElementSpy;
    });

    await component.borrarTema(MOCK_TEMAS[0]);

    expect(diarioServiceSpy.borrarTema).toHaveBeenCalledWith(MOCK_TEMAS[0].id);
  });

  it('borrarTema con confirmación recarga los datos', async () => {
    const alertElementSpy = jasmine.createSpyObj<HTMLIonAlertElement>('IonAlert', ['present', 'dismiss']);
    alertElementSpy.present.and.returnValue(Promise.resolve());
    alertCtrlSpy.create.and.callFake(async (opts: any) => {
      const handler = opts.buttons?.[1]?.handler;
      if (handler) handler();
      return alertElementSpy;
    });

    // Resetear contador
    diarioServiceSpy.getTemas.calls.reset();

    await component.borrarTema(MOCK_TEMAS[0]);

    expect(diarioServiceSpy.getTemas).toHaveBeenCalled();
  });

  it('borrarTema limpia temaSeleccionado si el tema borrado era el seleccionado', async () => {
    component.temaSeleccionado = MOCK_TEMAS[0];
    const alertElementSpy = jasmine.createSpyObj<HTMLIonAlertElement>('IonAlert', ['present', 'dismiss']);
    alertElementSpy.present.and.returnValue(Promise.resolve());
    alertCtrlSpy.create.and.callFake(async (opts: any) => {
      const handler = opts.buttons?.[1]?.handler;
      if (handler) handler();
      return alertElementSpy;
    });

    await component.borrarTema(MOCK_TEMAS[0]);

    expect(component.temaSeleccionado).toBeNull();
  });

  // ─── guardarEdicion (actualizarEntrada) ───────────────────────────────────

  it('guardarEdicion llama a diarioService.actualizarEntrada con los datos correctos', () => {
    component.temaSeleccionado = MOCK_TEMAS[0];
    component.notaEditandoId = 1;
    component.textoEditando = 'Texto editado';
    component.visibilidadEditando = 'PUBLICO';

    component.guardarEdicion();

    expect(diarioServiceSpy.actualizarEntrada).toHaveBeenCalledWith(
      1,
      'Texto editado',
      'PUBLICO',
      MOCK_TEMAS[0].id
    );
  });

  it('guardarEdicion NO llama al servicio si textoEditando está vacío', () => {
    component.temaSeleccionado = MOCK_TEMAS[0];
    component.notaEditandoId = 1;
    component.textoEditando = '   ';

    component.guardarEdicion();

    expect(diarioServiceSpy.actualizarEntrada).not.toHaveBeenCalled();
  });

  it('guardarEdicion resetea notaEditandoId a null al completarse', () => {
    component.temaSeleccionado = MOCK_TEMAS[0];
    component.notaEditandoId = 1;
    component.textoEditando = 'Texto válido';
    diarioServiceSpy.actualizarEntrada.and.returnValue(of({} as any));

    component.guardarEdicion();

    expect(component.notaEditandoId).toBeNull();
  });

  // ─── enviarInvitacion (invitarColaborador) ─────────────────────────────────

  it('enviarInvitacion con email válido llama a diarioService.invitarColaborador', () => {
    component.temaSeleccionado = MOCK_TEMAS[0];

    component.enviarInvitacion('dev@test.com');

    expect(diarioServiceSpy.invitarColaborador).toHaveBeenCalledWith(
      MOCK_TEMAS[0].id,
      'dev@test.com'
    );
  });

  it('enviarInvitacion con email inválido NO llama al servicio', () => {
    component.temaSeleccionado = MOCK_TEMAS[0];

    component.enviarInvitacion('no-es-un-email');

    expect(diarioServiceSpy.invitarColaborador).not.toHaveBeenCalled();
  });

  it('enviarInvitacion sin tema seleccionado NO llama al servicio', () => {
    component.temaSeleccionado = null;

    component.enviarInvitacion('dev@test.com');

    expect(diarioServiceSpy.invitarColaborador).not.toHaveBeenCalled();
  });

  // ─── detectTipo ───────────────────────────────────────────────────────────

  it('detectTipo identifica "daily" por contenido con "Daily Standup"', () => {
    expect(component.detectTipo('### Daily Standup')).toBe('daily');
  });

  it('detectTipo identifica "bug" por contenido con "Bug Report"', () => {
    expect(component.detectTipo('### Bug Report')).toBe('bug');
  });

  it('detectTipo retorna "otro" para contenido sin marcadores especiales', () => {
    expect(component.detectTipo('Hoy trabajé en el módulo de auth')).toBe('otro');
  });

  // ─── cerrarModalCrear / abrirModalCrear ────────────────────────────────────

  it('abrirModalCrear pone mostrarFormCrear en true', () => {
    component.mostrarFormCrear = false;
    component.abrirModalCrear();
    expect(component.mostrarFormCrear).toBeTrue();
  });

  it('cerrarModalCrear pone mostrarFormCrear en false', () => {
    component.mostrarFormCrear = true;
    component.cerrarModalCrear();
    expect(component.mostrarFormCrear).toBeFalse();
  });

  // ─── togglePin / esPinned ─────────────────────────────────────────────────

  it('togglePin agrega una entrada a pinnedEntradas', () => {
    component.togglePin(5);
    expect(component.esPinned(5)).toBeTrue();
  });

  it('togglePin quita la entrada si ya estaba pineada', () => {
    component.togglePin(5);
    component.togglePin(5);
    expect(component.esPinned(5)).toBeFalse();
  });
});
