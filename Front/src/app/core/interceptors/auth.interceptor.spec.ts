import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import {
  provideHttpClient,
  withInterceptors,
  HttpClient
} from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';
import { Auth } from '@angular/fire/auth';

/**
 * Deep Dive: El interceptor funcional (HttpInterceptorFn) inyecta Auth de Firebase
 * y lee el idToken reactivo (idToken(auth)) para añadir el header Authorization.
 *
 * Estrategia de test:
 * - Registramos el interceptor con provideHttpClient(withInterceptors([authInterceptor]))
 *   para probarlo de forma integrada en el pipeline HTTP real.
 * - Mockeamos Auth con onIdTokenChanged que controla el token emitido.
 * - Test 1: usuario autenticado → header Authorization: Bearer <token> presente.
 * - Test 2: usuario null → header Authorization ausente.
 *
 * idToken(auth) de @angular/fire/auth usa internamente onIdTokenChanged para construir
 * un Observable. Nuestro mock lo emula directamente.
 */
describe('authInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  // ─── Helpers para crear mocks de Auth ────────────────────

  function makeAuthMock(token: string | null) {
    const userWithToken = token
      ? { getIdToken: () => Promise.resolve(token) }
      : null;

    return {
      currentUser: userWithToken,
      onIdTokenChanged: (cb: any) => {
        cb(userWithToken);
        return () => { };
      },
      onAuthStateChanged: (cb: any) => {
        cb(userWithToken);
        return () => { };
      }
    };
  }

  afterEach(() => {
    if (httpMock) httpMock.verify();
  });

  // ─── Test 1: usuario autenticado ─────────────────────────

  it('should add Authorization: Bearer header when user is authenticated', fakeAsync(() => {
    const TOKEN = 'mock-firebase-token-xyz';

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: Auth, useValue: makeAuthMock(TOKEN) }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);

    httpClient.get('/api/test').subscribe();
    tick();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBeTrue();
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${TOKEN}`);
    req.flush({});
  }));

  // ─── Test 2: usuario no autenticado ──────────────────────

  it('should NOT add Authorization header when user is null', fakeAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: Auth, useValue: makeAuthMock(null) }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);

    httpClient.get('/api/test').subscribe();
    tick();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  }));

  // ─── Test 3: verificación estructural ────────────────────

  it('should be importable without errors', () => {
    expect(authInterceptor).toBeDefined();
    expect(typeof authInterceptor).toBe('function');
  });
});
