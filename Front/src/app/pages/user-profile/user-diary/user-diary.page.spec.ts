import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { UserDiaryPage } from './user-diary.page';
import { DiarioService } from 'src/app/services/diario.service';
import { DiarioTemaDto } from 'src/app/core/models/models';
import { getCommonTestProviders } from '../../../testing/test-utils';
import { of, throwError } from 'rxjs';

/**
 * Deep Dive: UserDiaryPage — Temas + Entradas + Filtrado local.
 *
 * La page NO usa signals (usa propiedades de clase normales).
 * `entradasFiltradas` es un getter que filtra por temaSeleccionado.
 * `crearEntrada` no invoca el servicio si el texto está vacío o no hay tema.
 * `seleccionarTema` / `volverATemas` controlan la navegación entre vistas.
 */
describe('UserDiaryPage', () => {
  let component: UserDiaryPage;
  let fixture: ComponentFixture<UserDiaryPage>;
  let diarioServiceSpy: jasmine.SpyObj<DiarioService>;

  const MOCK_TEMAS: DiarioTemaDto[] = [
    { id: 1, titulo: 'Angular', descripcion: 'Notas de Angular', usuarioId: 1 },
    { id: 2, titulo: 'Docker', descripcion: 'Notas de Docker', usuarioId: 1 }
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
      'borrarTema', 'borrarEntrada', 'actualizarEntrada', 'invitarColaborador'
    ]);
    diarioServiceSpy.getTemas.and.returnValue(of(MOCK_TEMAS));
    diarioServiceSpy.getMisEntradas.and.returnValue(of(MOCK_ENTRADAS));
    diarioServiceSpy.crearEntrada.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [UserDiaryPage],
      providers: [
        ...getCommonTestProviders(),
        { provide: DiarioService, useValue: diarioServiceSpy }
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
});
