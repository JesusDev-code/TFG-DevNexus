import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AdminUserPage } from './admin-user.page';
import { UsuarioService } from 'src/app/services/usuario.service';
import { UsuarioDto } from 'src/app/core/models/models';
import { getCommonTestProviders } from '../../../testing/test-utils';
import { of, throwError } from 'rxjs';

/**
 * Deep Dive: AdminUserPage — Signal + Computed + CRUD.
 *
 * `usuariosFiltrados` es un computed que filtra por nombre, email o rolNombre.
 * `abrirModalEditar` / `cerrarModal` controlan el modal de edición.
 * Validamos la copia defensiva en abrirModalEditar y la limpieza en cerrarModal.
 */
describe('AdminUserPage', () => {
  let component: AdminUserPage;
  let fixture: ComponentFixture<AdminUserPage>;
  let usuarioServiceSpy: jasmine.SpyObj<UsuarioService>;

  const MOCK_USUARIOS: UsuarioDto[] = [
    { id: 1, nombre: 'Carlos Lopez', email: 'carlos@test.com', rolNombre: 'USER', permiteContacto: true },
    { id: 2, nombre: 'Ana García', email: 'ana@test.com', rolNombre: 'STAFF', permiteContacto: false },
    { id: 3, nombre: 'Pedro Ruiz', email: 'pedro@test.com', rolNombre: 'ADMIN', permiteContacto: true },
    { id: 4, nombre: 'Laura Díaz', email: 'laura@empresa.com', rolNombre: 'USER', permiteContacto: true },
  ];

  beforeEach(async () => {
    usuarioServiceSpy = jasmine.createSpyObj('UsuarioService', [
      'getUsuarios', 'getDepartamentos', 'updateUsuario', 'deleteUsuario'
    ]);
    usuarioServiceSpy.getUsuarios.and.returnValue(of(MOCK_USUARIOS));
    usuarioServiceSpy.getDepartamentos.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [AdminUserPage],
      providers: [
        ...getCommonTestProviders(),
        { provide: UsuarioService, useValue: usuarioServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminUserPage);
    component = fixture.componentInstance;
  });

  // ─── Creación ────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ─── usuariosFiltrados ───────────────────────────────

  it('usuariosFiltrados returns all users when filtroTexto is empty', () => {
    component.usuarios.set(MOCK_USUARIOS);
    component.filtroTexto.set('');

    expect(component.usuariosFiltrados().length).toBe(4);
  });

  it('usuariosFiltrados filters by nombre (case insensitive)', () => {
    component.usuarios.set(MOCK_USUARIOS);
    component.filtroTexto.set('carlos');

    const result = component.usuariosFiltrados();
    expect(result.length).toBe(1);
    expect(result[0].nombre).toBe('Carlos Lopez');
  });

  it('usuariosFiltrados filters by email', () => {
    component.usuarios.set(MOCK_USUARIOS);
    component.filtroTexto.set('empresa');

    const result = component.usuariosFiltrados();
    expect(result.length).toBe(1);
    expect(result[0].email).toBe('laura@empresa.com');
  });

  it('usuariosFiltrados filters by rolNombre', () => {
    component.usuarios.set(MOCK_USUARIOS);
    component.filtroTexto.set('staff');

    const result = component.usuariosFiltrados();
    expect(result.length).toBe(1);
    expect(result[0].rolNombre).toBe('STAFF');
  });

  it('usuariosFiltrados returns empty when no match', () => {
    component.usuarios.set(MOCK_USUARIOS);
    component.filtroTexto.set('zzznomatch');

    expect(component.usuariosFiltrados().length).toBe(0);
  });

  // ─── abrirModalEditar / cerrarModal ─────────────────

  it('abrirModalEditar sets modalAbierto to true', () => {
    expect(component.modalAbierto()).toBeFalse();

    component.abrirModalEditar(MOCK_USUARIOS[0]);

    expect(component.modalAbierto()).toBeTrue();
  });

  it('abrirModalEditar sets usuarioEditando to a defensive copy', () => {
    const original = MOCK_USUARIOS[0];
    component.abrirModalEditar(original);

    const copia = component.usuarioEditando();
    expect(copia).not.toBe(original); // diferente referencia
    expect(copia.id).toBe(original.id);
    expect(copia.nombre).toBe(original.nombre);
  });

  it('cerrarModal resets modalAbierto to false', () => {
    component.abrirModalEditar(MOCK_USUARIOS[0]);
    expect(component.modalAbierto()).toBeTrue();

    component.cerrarModal();

    expect(component.modalAbierto()).toBeFalse();
  });

  it('cerrarModal clears usuarioEditando', () => {
    component.abrirModalEditar(MOCK_USUARIOS[0]);
    expect(component.usuarioEditando()).not.toBeNull();

    component.cerrarModal();

    expect(component.usuarioEditando()).toBeNull();
  });

  // ─── Reactividad encadenada ──────────────────────────

  it('reactive chain: changing filtroTexto updates usuariosFiltrados', () => {
    component.usuarios.set(MOCK_USUARIOS);

    component.filtroTexto.set('');
    expect(component.usuariosFiltrados().length).toBe(4);

    component.filtroTexto.set('ana');
    expect(component.usuariosFiltrados().length).toBe(1);

    component.filtroTexto.set('user');
    expect(component.usuariosFiltrados().length).toBe(2);

    component.filtroTexto.set('');
    expect(component.usuariosFiltrados().length).toBe(4);
  });

  // ─── cargarUsuarios HTTP ─────────────────────────────

  it('cargarUsuarios populates usuarios signal on HTTP success', () => {
    component.usuarios.set([]);
    usuarioServiceSpy.getUsuarios.and.returnValue(of(MOCK_USUARIOS));

    component.cargarUsuarios();

    expect(component.usuarios().length).toBe(4);
  });

  it('cargarUsuarios does not throw on HTTP error (error handled internally)', () => {
    usuarioServiceSpy.getUsuarios.and.returnValue(throwError(() => new Error('HTTP 500')));

    expect(() => component.cargarUsuarios()).not.toThrow();
  });
});
