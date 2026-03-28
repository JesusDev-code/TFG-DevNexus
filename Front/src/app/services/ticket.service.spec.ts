import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TicketService } from './ticket.service';
import { environment } from 'src/environments/environment';
import { TicketDto } from '../core/models/models';

describe('TicketService', () => {
  let service: TicketService;
  let httpMock: HttpTestingController;
  const API = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        TicketService
      ]
    });
    service = TestBed.inject(TicketService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ─── GET ─────────────────────────────────────────────

  it('getMisTickets() → GET /tickets/mis-tickets', () => {
    const mockTickets: TicketDto[] = [
      { id: 1, codigo: 'T-001', titulo: 'Bug login', descripcion: 'No carga', estado: 'ABIERTO', prioridad: 'ALTA', fechaCreacion: '2026-01-01', usuarioNombre: 'Test' }
    ];

    service.getMisTickets().subscribe(tickets => {
      expect(tickets.length).toBe(1);
      expect(tickets[0].codigo).toBe('T-001');
    });

    const req = httpMock.expectOne(`${API}/tickets/mis-tickets`);
    expect(req.request.method).toBe('GET');
    req.flush(mockTickets);
  });

  it('getTicketsAdmin() → GET /tickets', () => {
    service.getTicketsAdmin().subscribe(tickets => {
      expect(tickets).toEqual([]);
    });

    const req = httpMock.expectOne(`${API}/tickets`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getComentarios() → GET /tickets/:id/comentarios', () => {
    service.getComentarios(5).subscribe(res => {
      expect(res.length).toBe(1);
    });

    const req = httpMock.expectOne(`${API}/tickets/5/comentarios`);
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, texto: 'Ok', autorNombre: 'Admin', esStaff: true, fechaEnvio: '2026-01-01' }]);
  });

  it('getHistorico() → GET /ticket-historico/ticket/:id', () => {
    service.getHistorico(3).subscribe(res => {
      expect(res.length).toBe(0);
    });

    const req = httpMock.expectOne(`${API}/ticket-historico/ticket/3`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  // ─── POST ────────────────────────────────────────────

  it('crearTicket() → POST /tickets con body correcto', () => {
    const body = { titulo: 'Ticket nuevo', descripcion: 'Desc', prioridad: 'MEDIA' };

    service.crearTicket(body).subscribe(res => {
      expect(res.id).toBe(10);
    });

    const req = httpMock.expectOne(`${API}/tickets`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ id: 10, ...body, codigo: 'T-010', estado: 'ABIERTO', fechaCreacion: '2026-02-22', usuarioNombre: 'Test' });
  });

  it('enviarComentario() → POST /tickets/:id/comentarios', () => {
    service.enviarComentario(7, 'Mensaje de prueba').subscribe(res => {
      expect(res.texto).toBe('Mensaje de prueba');
    });

    const req = httpMock.expectOne(`${API}/tickets/7/comentarios`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ texto: 'Mensaje de prueba' });
    req.flush({ id: 1, texto: 'Mensaje de prueba', autorNombre: 'User', esStaff: false, fechaEnvio: '2026-02-22' });
  });

  // ─── PUT / PATCH ─────────────────────────────────────

  it('cambiarEstado() → PUT /tickets/:id/estado', () => {
    service.cambiarEstado(4, 'RESUELTO', 'Solucionado').subscribe(res => {
      expect(res.estado).toBe('RESUELTO');
    });

    const req = httpMock.expectOne(`${API}/tickets/4/estado`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ nuevoEstado: 'RESUELTO', comentario: 'Solucionado' });
    req.flush({ id: 4, codigo: 'T-004', titulo: 'X', descripcion: 'Y', estado: 'RESUELTO', prioridad: 'MEDIA', fechaCreacion: '2026-01-01', usuarioNombre: 'Test' });
  });

  it('actualizarTicketAdmin() → PATCH /tickets/:id', () => {
    service.actualizarTicketAdmin(2, { prioridad: 'ALTA' }).subscribe(res => {
      expect(res.prioridad).toBe('ALTA');
    });

    const req = httpMock.expectOne(`${API}/tickets/2`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ prioridad: 'ALTA' });
    req.flush({ id: 2, codigo: 'T-002', titulo: 'X', descripcion: 'Y', estado: 'ABIERTO', prioridad: 'ALTA', fechaCreacion: '2026-01-01', usuarioNombre: 'Test' });
  });
});
