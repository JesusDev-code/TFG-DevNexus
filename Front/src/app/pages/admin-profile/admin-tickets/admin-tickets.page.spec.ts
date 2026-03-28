import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AdminTicketsPage } from './admin-tickets.page';
import { TicketService } from 'src/app/services/ticket.service';
import { TicketDto } from 'src/app/core/models/models';
import { getCommonTestProviders } from '../../../testing/test-utils';
import { of, throwError } from 'rxjs';

/**
 * Deep Dive: AdminTicketsPage — Signal + Computed + HTTP.
 *
 * `ticketsFiltrados` es un computed que filtra por texto libre (codigo, titulo,
 * usuarioNombre). Los tests validan la reactividad síncrona de ese computed
 * y los side-effects del modal (abrirModalEditar / cerrarModal).
 */
describe('AdminTicketsPage', () => {
  let component: AdminTicketsPage;
  let fixture: ComponentFixture<AdminTicketsPage>;
  let ticketServiceSpy: jasmine.SpyObj<TicketService>;

  const MOCK_TICKETS: TicketDto[] = [
    { id: 1, codigo: 'T-001', titulo: 'Bug crítico', descripcion: 'Error en login', estado: 'ABIERTO', prioridad: 'ALTA', fechaCreacion: '2026-01-15', usuarioNombre: 'Carlos Lopez' },
    { id: 2, codigo: 'T-002', titulo: 'Mejora UI', descripcion: 'Cambiar colores', estado: 'EN_PROGRESO', prioridad: 'MEDIA', fechaCreacion: '2026-01-20', usuarioNombre: 'Ana García' },
    { id: 3, codigo: 'T-003', titulo: 'FAQ error', descripcion: 'Enlace roto', estado: 'RESUELTO', prioridad: 'BAJA', fechaCreacion: '2026-02-01', usuarioNombre: 'Pedro Ruiz' },
  ];

  beforeEach(async () => {
    ticketServiceSpy = jasmine.createSpyObj('TicketService', [
      'getTicketsAdmin', 'getComentarios', 'enviarComentario',
      'actualizarTicketAdmin', 'cambiarEstado'
    ]);
    ticketServiceSpy.getTicketsAdmin.and.returnValue(of(MOCK_TICKETS));
    ticketServiceSpy.getComentarios.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [AdminTicketsPage],
      providers: [
        ...getCommonTestProviders(),
        { provide: TicketService, useValue: ticketServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminTicketsPage);
    component = fixture.componentInstance;
  });

  // ─── Creación ────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ─── ticketsFiltrados ────────────────────────────────

  it('ticketsFiltrados returns all tickets when filtroTexto is empty', () => {
    component.tickets.set(MOCK_TICKETS);
    component.filtroTexto.set('');

    expect(component.ticketsFiltrados().length).toBe(3);
  });

  it('ticketsFiltrados filters by estado using estado text match', () => {
    component.tickets.set(MOCK_TICKETS);
    component.filtroTexto.set('RESUELTO');

    const result = component.ticketsFiltrados();
    // No filtra por estado directamente, filtra por codigo/titulo/usuarioNombre
    // 'RESUELTO' no coincide con ningún codigo, titulo ni usuarioNombre → 0
    expect(result.length).toBe(0);
  });

  it('ticketsFiltrados filters by codigo', () => {
    component.tickets.set(MOCK_TICKETS);
    component.filtroTexto.set('T-002');

    const result = component.ticketsFiltrados();
    expect(result.length).toBe(1);
    expect(result[0].codigo).toBe('T-002');
  });

  it('ticketsFiltrados filters by usuarioNombre', () => {
    component.tickets.set(MOCK_TICKETS);
    component.filtroTexto.set('ana');

    const result = component.ticketsFiltrados();
    expect(result.length).toBe(1);
    expect(result[0].usuarioNombre).toBe('Ana García');
  });

  it('ticketsFiltrados returns empty when no match', () => {
    component.tickets.set(MOCK_TICKETS);
    component.filtroTexto.set('zzznomatch');

    expect(component.ticketsFiltrados().length).toBe(0);
  });

  // ─── abrirModalEditar / cerrarModal ─────────────────

  it('abrirModalEditar sets modalAbierto to true', () => {
    expect(component.modalAbierto()).toBeFalse();

    component.abrirModalEditar(MOCK_TICKETS[0]);

    expect(component.modalAbierto()).toBeTrue();
  });

  it('abrirModalEditar sets ticketEditando to a defensive copy', () => {
    const original = MOCK_TICKETS[0];
    component.abrirModalEditar(original);

    const copia = component.ticketEditando()!;
    expect(copia).not.toBe(original); // referencia diferente → copia defensiva
    expect(copia.id).toBe(original.id);
    expect(copia.titulo).toBe(original.titulo);
  });

  it('cerrarModal resets modalAbierto to false', () => {
    component.abrirModalEditar(MOCK_TICKETS[0]);
    expect(component.modalAbierto()).toBeTrue();

    component.cerrarModal();

    expect(component.modalAbierto()).toBeFalse();
  });

  it('cerrarModal clears ticketEditando', () => {
    component.abrirModalEditar(MOCK_TICKETS[0]);
    expect(component.ticketEditando()).not.toBeNull();

    component.cerrarModal();

    expect(component.ticketEditando()).toBeNull();
  });

  // ─── Reactividad encadenada ──────────────────────────

  it('reactive chain: changing filtroTexto updates ticketsFiltrados', () => {
    component.tickets.set(MOCK_TICKETS);

    component.filtroTexto.set('');
    expect(component.ticketsFiltrados().length).toBe(3);

    component.filtroTexto.set('carlos');
    expect(component.ticketsFiltrados().length).toBe(1);

    component.filtroTexto.set('T-003');
    expect(component.ticketsFiltrados().length).toBe(1);

    component.filtroTexto.set('');
    expect(component.ticketsFiltrados().length).toBe(3);
  });

  // ─── cargarTickets HTTP ──────────────────────────────

  it('cargarTickets populates tickets signal on HTTP success', () => {
    component.tickets.set([]);
    ticketServiceSpy.getTicketsAdmin.and.returnValue(of(MOCK_TICKETS));

    component.cargarTickets();

    expect(component.tickets().length).toBe(3);
    expect(component.tickets()[0].codigo).toBe('T-001');
  });

  it('cargarTickets does not throw on HTTP error (error handled internally)', () => {
    ticketServiceSpy.getTicketsAdmin.and.returnValue(throwError(() => new Error('HTTP 500')));

    expect(() => component.cargarTickets()).not.toThrow();
  });
});
