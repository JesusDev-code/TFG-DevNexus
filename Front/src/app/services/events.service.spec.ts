import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { EventsService } from './events.service';
import { environment } from 'src/environments/environment';
import { Evento } from '../core/models/models';

describe('EventsService', () => {
  let service: EventsService;
  let httpMock: HttpTestingController;
  const API = `${environment.apiUrl}/eventos`;

  const MOCK_EVENTO: Evento = {
    id: 1,
    titulo: 'Standup Diario',
    descripcion: 'Reunión de equipo',
    fechaEvento: '2026-04-01',
    horaEvento: '09:00',
    visibilidad: 'PUBLICO',
    usuario: { id: 1, nombre: 'Admin' }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        EventsService
      ]
    });
    service = TestBed.inject(EventsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ─── GET ─────────────────────────────────────────────

  it('getEventos() → GET /eventos', () => {
    service.getEventos().subscribe(eventos => {
      expect(eventos.length).toBe(1);
      expect(eventos[0].titulo).toBe('Standup Diario');
    });

    const req = httpMock.expectOne(API);
    expect(req.request.method).toBe('GET');
    req.flush([MOCK_EVENTO]);
  });

  it('getEventos() → returns empty array when no events', () => {
    service.getEventos().subscribe(eventos => {
      expect(eventos).toEqual([]);
    });

    const req = httpMock.expectOne(API);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  // ─── POST ────────────────────────────────────────────

  it('crearEvento() → POST /eventos con body correcto', () => {
    const nuevoEvento: Evento = {
      titulo: 'Hackathon',
      descripcion: 'Evento de innovación',
      fechaEvento: '2026-05-10',
      horaEvento: '10:00',
      visibilidad: 'PUBLICO'
    };

    service.crearEvento(nuevoEvento).subscribe(res => {
      expect(res.id).toBe(2);
      expect(res.titulo).toBe('Hackathon');
    });

    const req = httpMock.expectOne(API);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(nuevoEvento);
    req.flush({ ...nuevoEvento, id: 2 });
  });

  it('crearEvento() → POST envía evento PRIVADO correctamente', () => {
    const eventoPrivado: Evento = {
      titulo: 'Reunión Interna',
      fechaEvento: '2026-04-15',
      horaEvento: '14:00',
      visibilidad: 'PRIVADO'
    };

    service.crearEvento(eventoPrivado).subscribe(res => {
      expect(res.visibilidad).toBe('PRIVADO');
    });

    const req = httpMock.expectOne(API);
    expect(req.request.method).toBe('POST');
    req.flush({ ...eventoPrivado, id: 3 });
  });

  // ─── DELETE ──────────────────────────────────────────

  it('eliminarEvento() → DELETE /eventos/:id', () => {
    service.eliminarEvento(1).subscribe(res => {
      expect(res).toBeFalsy();
    });

    const req = httpMock.expectOne(`${API}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('eliminarEvento() → DELETE usa el id correcto en la URL', () => {
    service.eliminarEvento(42).subscribe();

    const req = httpMock.expectOne(`${API}/42`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
