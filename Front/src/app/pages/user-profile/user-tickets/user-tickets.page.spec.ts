import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { UserTicketsPage } from './user-tickets.page';
import { TicketService } from 'src/app/services/ticket.service';
import { AuthService } from 'src/app/services/auth.service';
import { TicketDto } from 'src/app/core/models/models';
import { Auth } from '@angular/fire/auth';
import { FcmService } from 'src/app/services/fcm.service';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { provideIonicAngular } from '@ionic/angular/standalone';

/**
 * Deep Dive: UserTicketsPage — Gold Standard de testing con Signals.
 *
 * Esta page es el ejemplo perfecto de "Computed Signal + Service Injection".
 * El `ticketsFiltrados` es un computed que recalcula automáticamente cuando cambian
 * `tickets` o `filtroActual`. Los tests validan esa reactividad síncrona.
 *
 * Estrategia:
 * - Mockeamos AuthService.currentUser como un signal que emite un usuario fijo.
 * - Mockeamos TicketService para evitar HTTP reales.
 * - Inyectamos datos directamente en los signals del componente.
 */
describe('UserTicketsPage', () => {
  let component: UserTicketsPage;
  let fixture: ComponentFixture<UserTicketsPage>;
  let ticketServiceSpy: jasmine.SpyObj<TicketService>;

  // Fixtures
  const MOCK_TICKETS: TicketDto[] = [
    { id: 1, codigo: 'T-001', titulo: 'Bug crítico', descripcion: 'Error en login', estado: 'ABIERTO', prioridad: 'ALTA', fechaCreacion: '2026-01-15', usuarioNombre: 'User1' },
    { id: 2, codigo: 'T-002', titulo: 'Mejora UI', descripcion: 'Cambiar colores', estado: 'EN_PROGRESO', prioridad: 'MEDIA', fechaCreacion: '2026-01-20', usuarioNombre: 'User1' },
    { id: 3, codigo: 'T-003', titulo: 'FAQ error', descripcion: 'Enlace roto', estado: 'RESUELTO', prioridad: 'BAJA', fechaCreacion: '2026-02-01', usuarioNombre: 'User1' },
    { id: 4, codigo: 'T-004', titulo: 'Deploy falla', descripcion: 'Pipeline', estado: 'RESUELTO', prioridad: 'ALTA', fechaCreacion: '2026-02-10', usuarioNombre: 'User1' }
  ];

  beforeEach(async () => {
    ticketServiceSpy = jasmine.createSpyObj('TicketService', [
      'getMisTickets', 'crearTicket', 'cambiarEstado', 'getComentarios', 'enviarComentario'
    ]);
    ticketServiceSpy.getMisTickets.and.returnValue(of(MOCK_TICKETS));
    ticketServiceSpy.getComentarios.and.returnValue(of([]));

    const currentUserSignal = signal({ id: 1, nombre: 'Test User', email: 'test@test.com', rolNombre: 'USER', permiteContacto: true });
    const authServiceMock = {
      currentUser: currentUserSignal,
      isAuthenticated: true,
      isAdmin: false,
      updateUserProfile: () => of({})
    };

    const fcmMock = {
      obtenerToken: () => Promise.resolve(null),
      iniciarEscucha: () => { }
    };

    const authMock = {
      currentUser: null,
      onAuthStateChanged: (_cb: any) => () => { }
    };

    await TestBed.configureTestingModule({
      imports: [UserTicketsPage],
      providers: [
        provideIonicAngular(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: TicketService, useValue: ticketServiceSpy },
        { provide: AuthService, useValue: authServiceMock },
        { provide: Auth, useValue: authMock },
        { provide: FcmService, useValue: fcmMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserTicketsPage);
    component = fixture.componentInstance;
  });

  // ─── Creación ────────────────────────────────────────

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // ─── Estado Inicial ──────────────────────────────────

  it('initial state: filtroActual should be ABIERTOS', () => {
    expect(component.filtroActual()).toBe('ABIERTOS');
  });

  it('initial state: nuevoTicketVisible should be false', () => {
    expect(component.nuevoTicketVisible()).toBeFalse();
  });

  it('initial state: ticketAbiertoId should be null', () => {
    expect(component.ticketAbiertoId()).toBeNull();
  });

  // ─── Computed Signal: ticketsFiltrados ────────────────

  it('ticketsFiltrados: should return non-RESUELTO tickets when filter is ABIERTOS', () => {
    component.tickets.set(MOCK_TICKETS);
    component.filtroActual.set('ABIERTOS');

    const result = component.ticketsFiltrados();
    expect(result.length).toBe(2); // T-001 (ABIERTO) y T-002 (EN_PROGRESO)
    expect(result.every(t => t.estado !== 'RESUELTO')).toBeTrue();
  });

  it('ticketsFiltrados: should return only RESUELTO tickets when filter is RESUELTOS', () => {
    component.tickets.set(MOCK_TICKETS);
    component.filtroActual.set('RESUELTOS');

    const result = component.ticketsFiltrados();
    expect(result.length).toBe(2); // T-003 y T-004
    expect(result.every(t => t.estado === 'RESUELTO')).toBeTrue();
  });

  it('ticketsFiltrados: should return ALL tickets when filter is TODOS', () => {
    component.tickets.set(MOCK_TICKETS);
    component.filtroActual.set('TODOS');

    const result = component.ticketsFiltrados();
    expect(result.length).toBe(4);
  });

  it('ticketsFiltrados: should return empty when no tickets loaded', () => {
    component.tickets.set([]);
    const result = component.ticketsFiltrados();
    expect(result.length).toBe(0);
  });

  // ─── Signal Mutations ────────────────────────────────

  it('setFiltro: should update filtroActual signal', () => {
    component.setFiltro('RESUELTOS');
    expect(component.filtroActual()).toBe('RESUELTOS');

    component.setFiltro('TODOS');
    expect(component.filtroActual()).toBe('TODOS');

    component.setFiltro('ABIERTOS');
    expect(component.filtroActual()).toBe('ABIERTOS');
  });

  it('toggleNuevoTicket: should toggle nuevoTicketVisible signal', () => {
    expect(component.nuevoTicketVisible()).toBeFalse();

    component.toggleNuevoTicket();
    expect(component.nuevoTicketVisible()).toBeTrue();

    component.toggleNuevoTicket();
    expect(component.nuevoTicketVisible()).toBeFalse();
  });

  it('toggleChat: should toggle ticketAbiertoId', () => {
    const ticket = MOCK_TICKETS[0]; // id: 1

    component.toggleChat(ticket);
    expect(component.ticketAbiertoId()).toBe(1);

    // Cerrar el mismo ticket
    component.toggleChat(ticket);
    expect(component.ticketAbiertoId()).toBeNull();
  });

  it('toggleChat: should switch to a different ticket', () => {
    component.toggleChat(MOCK_TICKETS[0]); // abre ticket 1
    expect(component.ticketAbiertoId()).toBe(1);

    component.toggleChat(MOCK_TICKETS[1]); // cambia a ticket 2
    expect(component.ticketAbiertoId()).toBe(2);
  });

  // ─── Reactividad Encadenada ──────────────────────────

  it('changing filtroActual should reactively update ticketsFiltrados', () => {
    component.tickets.set(MOCK_TICKETS);

    // 1. Empezamos con ABIERTOS (2 tickets)
    component.filtroActual.set('ABIERTOS');
    expect(component.ticketsFiltrados().length).toBe(2);

    // 2. Cambiamos a RESUELTOS (2 tickets)
    component.filtroActual.set('RESUELTOS');
    expect(component.ticketsFiltrados().length).toBe(2);

    // 3. Cambiamos a TODOS (4 tickets)
    component.filtroActual.set('TODOS');
    expect(component.ticketsFiltrados().length).toBe(4);
  });
});
