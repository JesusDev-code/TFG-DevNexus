import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { UsuarioService } from './usuario.service';
import { environment } from 'src/environments/environment';
import { UsuarioDto } from '../core/models/models';

describe('UsuarioService', () => {
    let service: UsuarioService;
    let httpMock: HttpTestingController;
    const API = environment.apiUrl;

    const mockUser: UsuarioDto = {
        id: 1, nombre: 'Test User', email: 'test@test.com',
        rolNombre: 'USER', permiteContacto: true
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                UsuarioService
            ]
        });
        service = TestBed.inject(UsuarioService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    // ─── Perfil ──────────────────────────────────────────

    it('getPerfil() → GET /usuarios/perfil', () => {
        service.getPerfil().subscribe(res => {
            expect(res.nombre).toBe('Test User');
        });

        const req = httpMock.expectOne(`${API}/usuarios/perfil`);
        expect(req.request.method).toBe('GET');
        req.flush(mockUser);
    });

    // ─── Búsqueda ────────────────────────────────────────

    it('buscar() → GET /usuarios/buscar?query=<term>', () => {
        service.buscar('Juan').subscribe(res => {
            expect(res.length).toBe(1);
            expect(res[0].nombre).toBe('Juan García');
        });

        const req = httpMock.expectOne(`${API}/usuarios/buscar?query=Juan`);
        expect(req.request.method).toBe('GET');
        req.flush([{ ...mockUser, id: 2, nombre: 'Juan García' }]);
    });

    // ─── Admin CRUD ──────────────────────────────────────

    it('getUsuarios() → GET /usuarios', () => {
        service.getUsuarios().subscribe(res => {
            expect(res.length).toBe(2);
        });

        const req = httpMock.expectOne(`${API}/usuarios`);
        expect(req.request.method).toBe('GET');
        req.flush([mockUser, { ...mockUser, id: 2 }]);
    });

    it('deleteUsuario() → DELETE /usuarios/:id', () => {
        service.deleteUsuario(5).subscribe();

        const req = httpMock.expectOne(`${API}/usuarios/5`);
        expect(req.request.method).toBe('DELETE');
        req.flush(null);
    });

    it('updateUsuario() → PUT /usuarios/:id', () => {
        service.updateUsuario(3, { nombre: 'Nuevo Nombre' }).subscribe(res => {
            expect(res.nombre).toBe('Nuevo Nombre');
        });

        const req = httpMock.expectOne(`${API}/usuarios/3`);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual({ nombre: 'Nuevo Nombre' });
        req.flush({ ...mockUser, id: 3, nombre: 'Nuevo Nombre' });
    });

    it('getDepartamentos() → GET /usuarios/departamentos', () => {
        service.getDepartamentos().subscribe(res => {
            expect(res.length).toBe(2);
        });

        const req = httpMock.expectOne(`${API}/usuarios/departamentos`);
        expect(req.request.method).toBe('GET');
        req.flush([{ id: 1, nombre: 'IT' }, { id: 2, nombre: 'RRHH' }]);
    });
});
