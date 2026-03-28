import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { NotificacionService, NotificacionDto } from './notificacion.service';
import { environment } from 'src/environments/environment';

describe('NotificacionService', () => {
  let service: NotificacionService;
  let httpMock: HttpTestingController;
  const API = `${environment.apiUrl}/notificaciones`;

  const MOCK_NOTIFICACION: NotificacionDto = {
    id: 1,
    mensaje: 'Tienes un nuevo ticket asignado',
    fecha: '2026-01-15T10:00:00',
    leida: false
  };

  const MOCK_NOTIFICACION_LEIDA: NotificacionDto = {
    id: 1,
    mensaje: 'Tienes un nuevo ticket asignado',
    fecha: '2026-01-15T10:00:00',
    leida: true
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        NotificacionService
      ]
    });
    service = TestBed.inject(NotificacionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ─── GET ─────────────────────────────────────────────

  it('getMisNotificaciones() → GET /notificaciones', () => {
    service.getMisNotificaciones().subscribe(notifs => {
      expect(notifs.length).toBe(1);
      expect(notifs[0].mensaje).toBe('Tienes un nuevo ticket asignado');
      expect(notifs[0].leida).toBeFalse();
    });

    const req = httpMock.expectOne(API);
    expect(req.request.method).toBe('GET');
    req.flush([MOCK_NOTIFICACION]);
  });

  it('getMisNotificaciones() → returns empty array when no notifications', () => {
    service.getMisNotificaciones().subscribe(notifs => {
      expect(notifs).toEqual([]);
    });

    const req = httpMock.expectOne(API);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  // ─── PATCH ───────────────────────────────────────────

  it('marcarLeida() → PATCH /notificaciones/:id/leer', () => {
    service.marcarLeida(1).subscribe(res => {
      expect(res.leida).toBeTrue();
      expect(res.id).toBe(1);
    });

    const req = httpMock.expectOne(`${API}/1/leer`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({});
    req.flush(MOCK_NOTIFICACION_LEIDA);
  });

  it('marcarLeida() → envía PATCH al id correcto', () => {
    service.marcarLeida(7).subscribe();

    const req = httpMock.expectOne(`${API}/7/leer`);
    expect(req.request.method).toBe('PATCH');
    req.flush({ ...MOCK_NOTIFICACION_LEIDA, id: 7 });
  });

  it('marcarTodasLeidas() → PATCH /notificaciones/leer-todas', () => {
    service.marcarTodasLeidas().subscribe(res => {
      expect(res).toBeFalsy();
    });

    const req = httpMock.expectOne(`${API}/leer-todas`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({});
    req.flush(null);
  });

  // ─── DELETE ──────────────────────────────────────────

  it('eliminar() → DELETE /notificaciones/:id', () => {
    service.eliminar(1).subscribe(res => {
      expect(res).toBeFalsy();
    });

    const req = httpMock.expectOne(`${API}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('eliminar() → DELETE usa el id correcto en la URL', () => {
    service.eliminar(99).subscribe();

    const req = httpMock.expectOne(`${API}/99`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
