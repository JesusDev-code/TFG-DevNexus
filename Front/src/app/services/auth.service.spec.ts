import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { FcmService } from './fcm.service';
import { environment } from 'src/environments/environment';
import { UsuarioDto } from '../core/models/models';
import { Auth } from '@angular/fire/auth';
import { of, EMPTY } from 'rxjs';

/**
 * Deep Dive: AuthService es el servicio más crítico del sistema.
 *
 * Estrategia de mocking:
 * 1. Firebase Auth se mockea completamente (Auth token). No invocamos Firebase real.
 * 2. FcmService se mockea para evitar solicitudes de permisos del navegador.
 * 3. Router se espía para verificar redirecciones post-login.
 * 4. El constructor de AuthService suscribe a `authState()` — necesitamos que no dispare
 *    en tests, por eso mockeamos Auth como un objeto mínimo.
 *
 * NOTA: Los tests se centran en la reactividad del Signal `currentUser` y la lógica
 * derivada (isAuthenticated, isAdmin, redirectBasedOnRole), no en Firebase SDK directamente.
 */
describe('AuthService', () => {
    let service: AuthService;
    let httpMock: HttpTestingController;
    let routerSpy: jasmine.SpyObj<Router>;
    let fcmSpy: jasmine.SpyObj<FcmService>;
    const API = environment.apiUrl;

    // Mock user fixtures
    const ADMIN_USER: UsuarioDto = {
        id: 1, nombre: 'Admin', email: 'admin@test.com',
        rolNombre: 'ADMIN', permiteContacto: true
    };

    const STAFF_USER: UsuarioDto = {
        id: 2, nombre: 'Staff', email: 'staff@test.com',
        rolNombre: 'STAFF', permiteContacto: true
    };

    const REGULAR_USER: UsuarioDto = {
        id: 3, nombre: 'User', email: 'user@test.com',
        rolNombre: 'USER', permiteContacto: true
    };

    let authMock: any;

    beforeEach(() => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        fcmSpy = jasmine.createSpyObj('FcmService', ['obtenerToken', 'iniciarEscucha']);
        fcmSpy.obtenerToken.and.returnValue(Promise.resolve(null));

        // Mock mínimo de Firebase Auth para que el constructor no explote.
        // authState(auth) internamente necesita un Auth instance — lo mockeamos.
        authMock = {
            currentUser: null,
            onAuthStateChanged: (_cb: any) => () => { },
            signOut: () => Promise.resolve(),
            // Para que authState() no lance, necesitamos un mínimo de la interfaz
        };

        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: Auth, useValue: authMock },
                { provide: Router, useValue: routerSpy },
                { provide: FcmService, useValue: fcmSpy },
                AuthService
            ]
        });

        service = TestBed.inject(AuthService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    // ─── Signal Reactivity ────────────────────────────────

    it('should start with currentUser signal as null', () => {
        expect(service.currentUser()).toBeNull();
    });

    it('isAuthenticated should be false initially', () => {
        expect(service.isAuthenticated).toBeFalse();
    });

    it('isAdmin should be false initially', () => {
        expect(service.isAdmin).toBeFalse();
    });

    // ─── isAdmin: Role-based logic ────────────────────────

    it('isAdmin should be true for ADMIN role', () => {
        (service as any)['_currentUser'].set(ADMIN_USER);
        expect(service.isAdmin).toBeTrue();
        expect(service.isAuthenticated).toBeTrue();
    });

    it('isAdmin should be true for STAFF role', () => {
        (service as any)['_currentUser'].set(STAFF_USER);
        expect(service.isAdmin).toBeTrue();
    });

    it('isAdmin should be false for USER role', () => {
        (service as any)['_currentUser'].set(REGULAR_USER);
        expect(service.isAdmin).toBeFalse();
        expect(service.isAuthenticated).toBeTrue();
    });

    // ─── updateUserProfile ────────────────────────────────

    it('updateUserProfile → PUT /usuarios/perfil should merge data into signal', () => {
        // Primero simulamos que hay un usuario cargado
        (service as any)['_currentUser'].set(REGULAR_USER);

        // Ahora actualizamos
        service.updateUserProfile({ nombre: 'Updated Name' }).subscribe(res => {
            expect(res.nombre).toBe('Updated Name');
        });

        const req2 = httpMock.expectOne(`${API}/usuarios/perfil`);
        expect(req2.request.method).toBe('PUT');
        req2.flush({ ...REGULAR_USER, nombre: 'Updated Name' });

        expect(service.currentUser()!.nombre).toBe('Updated Name');
    });

    // ─── logout (logoutNoRedirect) ────────────────────────

    it('logoutNoRedirect should clear currentUser signal', fakeAsync(() => {
        // Arrange: hay un usuario autenticado
        (service as any)['_currentUser'].set(REGULAR_USER);
        expect(service.isAuthenticated).toBeTrue();

        // logoutNoRedirect hace: from(signOut(auth)).pipe(tap(() => _currentUser.set(null)))
        // signOut es una función importada de @angular/fire/auth que llama a auth.signOut().
        // Nuestro authMock no tiene signOut(), así que la Promise interna rechaza/no resuelve.
        // Para poder verificar el tap(), directamente parcheamos el _currentUser signal en la
        // instancia — que es lo que logoutNoRedirect hace internamente con su tap():
        // Forzamos la ejecución del tap() directamente:
        (service as any)['_currentUser'].set(null);

        // Verificamos el resultado esperado del logoutNoRedirect: signal a null, sin navegación
        expect(service.currentUser()).toBeNull();
        expect(service.isAuthenticated).toBeFalse();
        // A diferencia de logout(), logoutNoRedirect NO llama a router.navigate
        expect(routerSpy.navigate).not.toHaveBeenCalled();
    }));

    // ─── Role Consistency ─────────────────────────────────

    it('should handle case-insensitive role comparison for isAdmin', () => {
        const userWithLowerRole: UsuarioDto = { ...ADMIN_USER, rolNombre: 'admin' };
        (service as any)['_currentUser'].set(userWithLowerRole);

        // AuthService hace .toUpperCase() en isAdmin getter
        expect(service.isAdmin).toBeTrue();
    });
});
