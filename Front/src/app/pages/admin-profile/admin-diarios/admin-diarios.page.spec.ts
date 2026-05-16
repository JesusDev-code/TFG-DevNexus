import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AdminDiariosPage } from './admin-diarios.page';
import { getCommonTestProviders } from '../../../testing/test-utils';
import { environment } from 'src/environments/environment';

describe('AdminDiariosPage', () => {
  let component: AdminDiariosPage;
  let fixture: ComponentFixture<AdminDiariosPage>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDiariosPage, HttpClientTestingModule],
      providers: getCommonTestProviders(),
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDiariosPage);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`${environment.apiUrl}/usuarios`);
    req.flush([]);
    expect(component).toBeTruthy();
  });

  it('should have correct initial signal state', () => {
    // Read signals BEFORE detectChanges — no HTTP call has been made yet
    expect(component.vista()).toBe('USUARIOS');
    expect(component.usuarios()).toEqual([]);
    expect(component.usuariosFiltrados()).toEqual([]);
    expect(component.temas()).toEqual([]);
    expect(component.diarios()).toEqual([]);
    expect(component.cargando()).toBe(false);
  });

  it('cargarUsuarios() should populate signals on success', () => {
    fixture.detectChanges();
    const mockUsuarios = [
      { id: 1, nombre: 'Alice', email: 'alice@test.com' },
      { id: 2, nombre: 'Bob', email: 'bob@test.com' }
    ];
    const req = httpMock.expectOne(`${environment.apiUrl}/usuarios`);
    req.flush(mockUsuarios);

    expect(component.usuarios()).toEqual(mockUsuarios);
    expect(component.usuariosFiltrados()).toEqual(mockUsuarios);
    expect(component.cargando()).toBe(false);
  });

  it('cargarUsuarios() should set cargando to false on error', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`${environment.apiUrl}/usuarios`);
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

    expect(component.cargando()).toBe(false);
    expect(component.usuarios()).toEqual([]);
  });

  it('buscarUsuario() should filter usuariosFiltrados', () => {
    fixture.detectChanges();
    // Flush the initial cargarUsuarios() request
    const initReq = httpMock.expectOne(`${environment.apiUrl}/usuarios`);
    const mockUsuarios = [
      { id: 1, nombre: 'Alice', email: 'alice@test.com' },
      { id: 2, nombre: 'Bob', email: 'bob@test.com' }
    ];
    initReq.flush(mockUsuarios);

    // Set usuarios signal directly and call buscarUsuario
    component.usuarios.set(mockUsuarios);
    component.usuariosFiltrados.set(mockUsuarios);

    const mockEvent = { target: { value: 'alice' } };
    component.buscarUsuario(mockEvent);

    expect(component.usuariosFiltrados().length).toBe(1);
    expect(component.usuariosFiltrados()[0].nombre).toBe('Alice');
  });

  it('seleccionarUsuario() should set vista to TEMAS', () => {
    fixture.detectChanges();
    // Flush the initial cargarUsuarios() request
    const initReq = httpMock.expectOne(`${environment.apiUrl}/usuarios`);
    initReq.flush([]);

    const mockUser = { id: 99, nombre: 'Test', email: 'test@test.com' };
    component.seleccionarUsuario(mockUser);

    // Flush the cargarTemasDelUsuario() request triggered by seleccionarUsuario
    const temasReq = httpMock.expectOne(
      `${environment.apiUrl}/diario-temas/usuario/99`
    );
    temasReq.flush([]);

    expect(component.vista()).toBe('TEMAS');
    expect(component.usuarioSeleccionado).toEqual(mockUser);
  });

  it('volverALista() should reset state', () => {
    fixture.detectChanges();
    // Flush the initial cargarUsuarios() request
    const initReq = httpMock.expectOne(`${environment.apiUrl}/usuarios`);
    initReq.flush([]);

    // Put the component in TEMAS view first
    component.vista.set('TEMAS');
    component.diarios.set([{ id: 1, contenido: 'test' } as any]);
    component.usuarioSeleccionado = { id: 99, nombre: 'Test' };

    component.volverALista();

    expect(component.vista()).toBe('USUARIOS');
    expect(component.diarios()).toEqual([]);
    expect(component.usuarioSeleccionado).toBeNull();
  });
});
