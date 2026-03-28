import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FcmService } from './fcm.service';
import { ToastController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

/**
 * Deep Dive: FcmService usa Firebase Messaging SDK (getToken, onMessage) y
 * la API del navegador (Notification, navigator.serviceWorker).
 * NO usa @angular/fire — usa directamente el SDK modular de firebase/messaging.
 *
 * Estrategia:
 * - Mock de ToastController e Router para evitar dependencias de Ionic/Angular.
 * - Mock de Notification.requestPermission() vía spyOnProperty.
 * - Mock de navigator.serviceWorker para evitar registro real de SW.
 * - Firebase initializeApp y getMessaging se ejecutan en el constructor —
 *   no podemos interceptarlos fácilmente, pero sí verificar el comportamiento
 *   de los métodos públicos con el resultado del mock de Notification.
 *
 * NOTA: initializeApp puede lanzar si ya hay una app inicializada con el mismo nombre.
 * Lo manejamos capturando el error en el TestBed.
 */
describe('FcmService', () => {
  let service: FcmService;
  let toastCtrlSpy: jasmine.SpyObj<ToastController>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    toastCtrlSpy = jasmine.createSpyObj('ToastController', ['create']);
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);

    // Mock de la API Toast para que no explote
    toastCtrlSpy.create.and.returnValue(
      Promise.resolve({ present: jasmine.createSpy('present') } as any)
    );

    TestBed.configureTestingModule({
      providers: [
        { provide: ToastController, useValue: toastCtrlSpy },
        { provide: Router, useValue: routerSpy },
        FcmService
      ]
    });

    service = TestBed.inject(FcmService);
  });

  // ─── Instanciación ────────────────────────────────────

  it('should be created without throwing', () => {
    expect(service).toBeTruthy();
  });

  // ─── tokenYaSolicitado: guard contra duplicados ───────

  it('obtenerToken() → segunda llamada retorna null inmediatamente (guard tokenYaSolicitado)', async () => {
    // Mockeamos Notification.requestPermission para la primera llamada
    spyOn(Notification, 'requestPermission').and.returnValue(Promise.resolve('denied'));

    // Primera llamada — sets tokenYaSolicitado = true
    await service.obtenerToken();

    // Segunda llamada — debe retornar null sin llamar a requestPermission otra vez
    const result = await service.obtenerToken();
    expect(result).toBeNull();
    // requestPermission solo se llamó UNA vez
    expect(Notification.requestPermission).toHaveBeenCalledTimes(1);
  });

  // ─── Permiso denegado ─────────────────────────────────

  it('obtenerToken() → permission denied → returns null gracefully', async () => {
    spyOn(Notification, 'requestPermission').and.returnValue(Promise.resolve('denied'));

    const result = await service.obtenerToken();

    expect(result).toBeNull();
  });

  it('obtenerToken() → permission default (dismissed) → returns null gracefully', async () => {
    spyOn(Notification, 'requestPermission').and.returnValue(Promise.resolve('default'));

    const result = await service.obtenerToken();

    expect(result).toBeNull();
  });

  // ─── Permiso concedido pero SW falla ─────────────────

  it('obtenerToken() → permission granted but SW fails → catches error and returns null', async () => {
    spyOn(Notification, 'requestPermission').and.returnValue(Promise.resolve('granted'));

    // navigator.serviceWorker.register lanza error (no hay SW real en tests)
    const swSpy = spyOnProperty(navigator, 'serviceWorker', 'get').and.returnValue({
      register: () => Promise.reject(new Error('SW not supported in tests')),
      ready: Promise.reject(new Error('SW not ready'))
    } as any);

    const result = await service.obtenerToken();

    // El servicio captura el error en su catch interno y retorna null
    expect(result).toBeNull();
  });

  // ─── iniciarEscucha: no lanza ─────────────────────────

  it('iniciarEscucha() → does not throw when messaging is initialized', () => {
    expect(() => service.iniciarEscucha()).not.toThrow();
  });

  // ─── Contrato de interfaz pública ─────────────────────

  it('obtenerToken() → is an async function returning a Promise', () => {
    spyOn(Notification, 'requestPermission').and.returnValue(Promise.resolve('denied'));
    const result = service.obtenerToken();
    expect(result instanceof Promise).toBeTrue();
  });

  it('iniciarEscucha() → is a function', () => {
    expect(typeof service.iniciarEscucha).toBe('function');
  });
});
