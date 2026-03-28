import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AdminAuditarPage } from './admin-auditar.page';
import { getCommonTestProviders } from '../../../testing/test-utils';
import { environment } from 'src/environments/environment';
import { AuditoriaDto } from '../../../core/models/models';

describe('AdminAuditarPage', () => {
  let component: AdminAuditarPage;
  let fixture: ComponentFixture<AdminAuditarPage>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAuditarPage, HttpClientTestingModule],
      providers: getCommonTestProviders(),
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminAuditarPage);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne(
      `${environment.apiUrl}/auditorias?page=0&size=20&q=`
    );
    req.flush({ content: [], totalPages: 0 });
    expect(component).toBeTruthy();
  });

  it('should have correct initial signal state', () => {
    // Read signals BEFORE detectChanges — no HTTP call has been made yet
    expect(component.logs()).toEqual([]);
    expect(component.page()).toBe(0);
    expect(component.totalPages()).toBe(0);
    expect(component.textoBusqueda()).toBe('');
    expect(component.cargando()).toBe(false);
    expect(component.allPagesLoaded()).toBe(false);
  });

  it('cargarLogs(true) should populate logs on success', () => {
    fixture.detectChanges();
    const mockLogs: AuditoriaDto[] = [
      { id: 1, accion: 'LOGIN', recurso: 'Usuario', descripcion: 'User login', severidad: 'INFO', fecha: '2026-01-01T10:00:00', usuarioEmail: 'alice@test.com' },
      { id: 2, accion: 'ACCESO', recurso: 'Ticket', descripcion: 'Invalid attempt', severidad: 'WARNING', fecha: '2026-01-01T11:00:00', usuarioEmail: 'bob@test.com' }
    ];
    const req = httpMock.expectOne(
      `${environment.apiUrl}/auditorias?page=0&size=20&q=`
    );
    req.flush({ content: mockLogs, totalPages: 3 });

    expect(component.logs()).toEqual(mockLogs);
    expect(component.totalPages()).toBe(3);
    expect(component.cargando()).toBe(false);
  });

  it('cargarLogs() should handle error via catchError', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne(
      `${environment.apiUrl}/auditorias?page=0&size=20&q=`
    );
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

    expect(component.cargando()).toBe(false);
    expect(component.logs()).toEqual([]);
  });

  it('allPagesLoaded computed should return true on last page', () => {
    fixture.detectChanges();
    // Flush the initial cargarLogs(true) request
    const initReq = httpMock.expectOne(
      `${environment.apiUrl}/auditorias?page=0&size=20&q=`
    );
    initReq.flush({ content: [], totalPages: 3 });

    // Set signals so we are on the last page (page 2 of 3, index 0-based)
    component.totalPages.set(3);
    component.page.set(2);

    expect(component.allPagesLoaded()).toBe(true);
  });

  it('getIcon() should return correct icon per severity', () => {
    expect(component.getIcon('DANGER')).toBe('alert-circle-outline');
    expect(component.getIcon('WARNING')).toBe('information-circle-outline');
    expect(component.getIcon('INFO')).toBe('shield-checkmark-outline');
    expect(component.getIcon('UNKNOWN')).toBe('shield-checkmark-outline');
  });

  it('getClass() should lowercase severity', () => {
    expect(component.getClass('DANGER')).toBe('danger');
    expect(component.getClass('WARNING')).toBe('warning');
    expect(component.getClass('INFO')).toBe('info');
    // null/undefined guard
    expect(component.getClass('')).toBe('info');
  });
});
