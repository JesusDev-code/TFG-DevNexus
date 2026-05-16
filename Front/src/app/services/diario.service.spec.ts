import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { DiarioService, InvitacionPendienteDto } from './diario.service';
import { DiarioTemaDto, DiarioTemaCreateDto } from '../core/models/models';
import { environment } from 'src/environments/environment';

describe('DiarioService', () => {
  let service: DiarioService;
  let httpMock: HttpTestingController;
  const API = environment.apiUrl;

  // ─── Fixtures ────────────────────────────────────────────

  const MOCK_TEMA: DiarioTemaDto = { id: 1, titulo: 'Reflexiones', descripcion: 'Mis notas', usuarioId: 10 };
  const MOCK_TEMAS: DiarioTemaDto[] = [MOCK_TEMA];

  const MOCK_INVITACION: InvitacionPendienteDto = {
    id: 5, temaTitulo: 'Reflexiones', ownerNombre: 'Ana', fecha: '2026-01-10'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        DiarioService
      ]
    });
    service = TestBed.inject(DiarioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ─── 1. Gestión de Temas ──────────────────────────────────

  it('getTemas() → GET /diario-temas', () => {
    service.getTemas().subscribe(temas => {
      expect(temas.length).toBe(1);
      expect(temas[0].titulo).toBe('Reflexiones');
    });

    const req = httpMock.expectOne(`${API}/diario-temas`);
    expect(req.request.method).toBe('GET');
    req.flush(MOCK_TEMAS);
  });

  it('crearTema() → POST /diario-temas con body correcto', () => {
    const body: DiarioTemaCreateDto = { titulo: 'Nuevo Tema', descripcion: 'Desc' };

    service.crearTema(body).subscribe(tema => {
      expect(tema.id).toBe(1);
      expect(tema.titulo).toBe('Nuevo Tema');
    });

    const req = httpMock.expectOne(`${API}/diario-temas`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ ...MOCK_TEMA, titulo: 'Nuevo Tema' });
  });

  it('borrarTema() → DELETE /diario-temas/:id', () => {
    service.borrarTema(1).subscribe(res => {
      expect(res).toBeFalsy();
    });

    const req = httpMock.expectOne(`${API}/diario-temas/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  // ─── 2. Gestión de Colaboración ──────────────────────────

  it('invitarColaborador() → POST /diario-temas/:id/invitar con email', () => {
    service.invitarColaborador(1, 'colaborador@test.com').subscribe();

    const req = httpMock.expectOne(`${API}/diario-temas/1/invitar`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'colaborador@test.com' });
    req.flush({ ok: true });
  });

  it('getInvitacionesPendientes() → GET /diario-temas/invitaciones/pendientes', () => {
    service.getInvitacionesPendientes().subscribe(invitaciones => {
      expect(invitaciones.length).toBe(1);
      expect(invitaciones[0].temaTitulo).toBe('Reflexiones');
    });

    const req = httpMock.expectOne(`${API}/diario-temas/invitaciones/pendientes`);
    expect(req.request.method).toBe('GET');
    req.flush([MOCK_INVITACION]);
  });

  it('responderInvitacion(id, true) → POST /diario-temas/invitaciones/:id/responder con param aceptar=true', () => {
    service.responderInvitacion(5, true).subscribe();

    const req = httpMock.expectOne(r =>
      r.url === `${API}/diario-temas/invitaciones/5/responder` &&
      r.params.get('aceptar') === 'true'
    );
    expect(req.request.method).toBe('POST');
    req.flush(null);
  });

  it('responderInvitacion(id, false) → POST con param aceptar=false', () => {
    service.responderInvitacion(5, false).subscribe();

    const req = httpMock.expectOne(r =>
      r.url === `${API}/diario-temas/invitaciones/5/responder` &&
      r.params.get('aceptar') === 'false'
    );
    expect(req.request.method).toBe('POST');
    req.flush(null);
  });

  // ─── 3. Gestión de Diarios (Entradas) ────────────────────

  it('getMisEntradas() → GET /diarios/mis-diarios con sort param', () => {
    service.getMisEntradas().subscribe(entradas => {
      expect(entradas).toBeTruthy();
    });

    const req = httpMock.expectOne(`${API}/diarios/mis-diarios?sort=fechaCreacion,desc`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getEntradasPublicas() → GET /diarios/publicos con sort param', () => {
    service.getEntradasPublicas().subscribe(entradas => {
      expect(entradas).toBeTruthy();
    });

    const req = httpMock.expectOne(`${API}/diarios/publicos?sort=fechaCreacion,desc`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('crearEntrada() → POST /diarios con body correcto', () => {
    service.crearEntrada('Mi reflexión', 1, 'PRIVADO').subscribe(res => {
      expect(res.id).toBe(99);
    });

    const req = httpMock.expectOne(`${API}/diarios`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      contenido: 'Mi reflexión',
      visibilidad: 'PRIVADO',
      temaId: 1
    });
    req.flush({ id: 99, contenido: 'Mi reflexión', visibilidad: 'PRIVADO', temaId: 1 });
  });

  it('borrarEntrada() → DELETE /diarios/:id', () => {
    service.borrarEntrada(7).subscribe();

    const req = httpMock.expectOne(`${API}/diarios/7`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('actualizarEntrada() → PUT /diarios/:id con body correcto', () => {
    service.actualizarEntrada(3, 'Contenido actualizado', 'PUBLICO', 2).subscribe(res => {
      expect(res.id).toBe(3);
    });

    const req = httpMock.expectOne(`${API}/diarios/3`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({
      contenido: 'Contenido actualizado',
      visibilidad: 'PUBLICO',
      temaId: 2
    });
    req.flush({ id: 3, contenido: 'Contenido actualizado', visibilidad: 'PUBLICO', temaId: 2 });
  });

  // ─── 4. IDE de Proyectos ──────────────────────────────────

  it('crearArchivoIDE() → POST /diarios con tipo FILE y filename', () => {
    service.crearArchivoIDE(1, 'src/index.html', '<!DOCTYPE html>').subscribe(res => {
      expect(res.filename).toBe('src/index.html');
      expect(res.tipo).toBe('FILE');
    });

    const req = httpMock.expectOne(`${API}/diarios`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      contenido: '<!DOCTYPE html>',
      visibilidad: 'PRIVADO',
      temaId: 1,
      tipo: 'FILE',
      filename: 'src/index.html'
    });
    req.flush({
      id: 10, contenido: '<!DOCTYPE html>', visibilidad: 'PRIVADO',
      temaId: 1, tipo: 'FILE', filename: 'src/index.html',
      fechaCreacion: '2026-05-04T18:00:00'
    });
  });

  it('getArchivosActuales() → GET /diarios/tema/:id/archivos y devuelve DiarioDto con contenido', () => {
    const MOCK_ARCHIVOS = [
      { id: 10, filename: 'src/index.html', tipo: 'FILE', contenido: '<h1>Hola</h1>', fechaCreacion: '2026-05-04T18:00:00' },
      { id: 11, filename: 'src/style.css',  tipo: 'FILE', contenido: 'body {}',        fechaCreacion: '2026-05-04T18:01:00' }
    ];

    service.getArchivosActuales(1).subscribe(archivos => {
      expect(archivos.length).toBe(2);
      expect(archivos[0].filename).toBe('src/index.html');
      expect(archivos[0].contenido).toBe('<h1>Hola</h1>');
      expect(archivos[1].filename).toBe('src/style.css');
    });

    const req = httpMock.expectOne(`${API}/diarios/tema/1/archivos`);
    expect(req.request.method).toBe('GET');
    req.flush(MOCK_ARCHIVOS);
  });

  it('crearEntrada() con tipo FILE → POST /diarios con filename', () => {
    service.crearEntrada('// main.ts', 2, 'PRIVADO', 'FILE', 'main.ts').subscribe();

    const req = httpMock.expectOne(`${API}/diarios`);
    expect(req.request.body).toEqual({
      contenido: '// main.ts',
      visibilidad: 'PRIVADO',
      temaId: 2,
      tipo: 'FILE',
      filename: 'main.ts'
    });
    req.flush({});
  });
});
