import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { SignInComponent } from './sign-in.component';
import { AuthService } from 'src/app/services/auth.service';
import { Subject } from 'rxjs';
import { UsuarioDto } from 'src/app/core/models/models';
import { getCommonTestProviders } from '../../../../../testing/test-utils';
import { of, throwError } from 'rxjs';

/**
 * Deep Dive: SignInComponent no usa formularios reactivos — usa ngModel (FormsModule).
 * La lógica de negocio vive en doLogin() / doRegister() / handleError().
 * Testeamos:
 * - Estado inicial (isLoading=false, isRegister=false)
 * - Validación: email/password vacíos → toast de warning, isLoading se resetea
 * - Firebase error → handleError() muestra mensaje de usuario amigable
 * - Login exitoso → isLoading false después de timeout, navegación invocada
 * - toggleMode() cambia entre login/register
 *
 * Usamos NO_ERRORS_SCHEMA para ignorar componentes Ionic y ng-rive no disponibles en test.
 */
describe('SignInComponent', () => {
  let component: SignInComponent;
  let fixture: ComponentFixture<SignInComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  // Stubs vacíos para los callbacks de Rive (success, failure, reset, confetti)
  const noop = { fire: () => {} };

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [
      'login', 'register', 'logout', 'loginWithGoogle', 'recuperarContrasena',
      'logoutNoRedirect'
    ], {
      isAdmin: false,
      isAuthenticated: false
    });
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [SignInComponent],
      providers: [
        ...getCommonTestProviders(),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SignInComponent);
    component = fixture.componentInstance;

    // Suprimimos presentToast para evitar dependencia de ToastController real
    spyOn(component, 'presentToast').and.resolveTo();
  });

  // ─── Creación ────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ─── Estado inicial ───────────────────────────────────────

  it('initial state: isLoading should be false', () => {
    expect(component.isLoading).toBeFalse();
  });

  it('initial state: isRegister should be false', () => {
    expect(component.isRegister).toBeFalse();
  });

  it('initial state: email and password should be empty strings', () => {
    expect(component.email).toBe('');
    expect(component.password).toBe('');
  });

  // ─── toggleMode ──────────────────────────────────────────

  it('toggleMode() should switch isRegister between false and true', () => {
    expect(component.isRegister).toBeFalse();
    component.toggleMode();
    expect(component.isRegister).toBeTrue();
    component.toggleMode();
    expect(component.isRegister).toBeFalse();
  });

  // ─── Validación: campos vacíos ────────────────────────────

  it('doLogin() with empty email → shows warning toast and does NOT call authService.login', () => {
    component.email = '';
    component.password = 'password123';

    component.doLogin(noop, noop, noop, noop);

    expect(authServiceSpy.login).not.toHaveBeenCalled();
    expect(component.presentToast).toHaveBeenCalledWith('Faltan datos', 'warning');
  });

  it('doLogin() with empty password → shows warning toast and does NOT call authService.login', () => {
    component.email = 'user@test.com';
    component.password = '';

    component.doLogin(noop, noop, noop, noop);

    expect(authServiceSpy.login).not.toHaveBeenCalled();
    expect(component.presentToast).toHaveBeenCalledWith('Faltan datos', 'warning');
  });

  // ─── Loading state ────────────────────────────────────────

  it('doLogin() with valid fields → sets isLoading=true before auth call', () => {
    component.email = 'user@test.com';
    component.password = 'password123';
    // Hacemos que login no complete para observar el estado intermedio
    authServiceSpy.login.and.returnValue(new Subject<UsuarioDto | null>().asObservable());

    component.doLogin(noop, noop, noop, noop);

    expect(component.isLoading).toBeTrue();
  });

  // ─── Error de Firebase: credenciales incorrectas ─────────

  it('handleError() in login mode → shows "Credenciales incorrectas" toast', () => {
    component.isRegister = false;
    const firebaseError = { code: 'auth/wrong-password', message: 'Wrong password' };

    component.handleError(firebaseError, noop, noop);

    expect(component.presentToast).toHaveBeenCalledWith(
      'Credenciales incorrectas. Verifica tu correo y contraseña.',
      'danger'
    );
  });

  it('handleError() in login mode for auth/user-not-found → shows "Credenciales incorrectas" toast', () => {
    component.isRegister = false;
    const firebaseError = { code: 'auth/user-not-found', message: 'User not found' };

    component.handleError(firebaseError, noop, noop);

    expect(component.presentToast).toHaveBeenCalledWith(
      'Credenciales incorrectas. Verifica tu correo y contraseña.',
      'danger'
    );
  });

  it('handleError() in register mode with status 409 → shows "correo ya registrado" toast', () => {
    component.isRegister = true;
    const conflictError = { status: 409, error: { message: 'Email already exists' } };

    component.handleError(conflictError, noop, noop);

    expect(component.presentToast).toHaveBeenCalledWith(
      'Este correo ya está registrado. Por favor, inicia sesión.',
      'danger'
    );
  });

  it('handleError() in register mode with weak-password error → shows appropriate message', () => {
    component.isRegister = true;
    const weakPwError = { status: 400, message: 'weak-password' };

    component.handleError(weakPwError, noop, noop);

    expect(component.presentToast).toHaveBeenCalledWith(
      'La contraseña es demasiado débil.',
      'danger'
    );
  });

  // ─── Login exitoso: navegación ────────────────────────────

  it('handleSuccess() in login mode → emits onClose and navigates to /user-profile for non-admin', fakeAsync(() => {
    component.isRegister = false;
    // authService.isAdmin es false (configurado en createSpyObj)
    const closeSpy = spyOn(component.onClose, 'emit');

    component.handleSuccess(noop, noop);
    tick(2000); // Avanzamos el setTimeout interno

    expect(closeSpy).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/user-profile']);
    expect(component.isLoading).toBeFalse();
  }));

  it('handleSuccess() in login mode → navigates to /admin-profile for admin user', fakeAsync(() => {
    component.isRegister = false;
    // Redefinimos isAdmin como true
    Object.defineProperty(authServiceSpy, 'isAdmin', { get: () => true });

    component.handleSuccess(noop, noop);
    tick(2000);

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin-profile']);
  }));

  it('handleSuccess() in register mode → shows success toast and does NOT navigate', fakeAsync(() => {
    component.isRegister = true;

    component.handleSuccess(noop, noop);
    tick(2000);

    expect(component.presentToast).toHaveBeenCalledWith(
      '¡Cuenta creada! Inicia sesión para continuar.',
      'success'
    );
    expect(component.isRegister).toBeFalse();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  }));

  // ─── doLogin integrado ────────────────────────────────────

  it('doLogin() on successful auth → calls authService.login with email/password', fakeAsync(() => {
    component.email = 'user@test.com';
    component.password = 'password123';
    authServiceSpy.login.and.returnValue(of({ id: 1, nombre: 'User', email: 'user@test.com', rolNombre: 'USER', permiteContacto: true }));

    component.doLogin(noop, noop, noop, noop);
    tick(2000);
    flush();

    expect(authServiceSpy.login).toHaveBeenCalledWith('user@test.com', 'password123');
  }));

  it('doLogin() on auth error → isLoading becomes false after timeout', fakeAsync(() => {
    component.email = 'user@test.com';
    component.password = 'wrongpass';
    authServiceSpy.login.and.returnValue(throwError(() => ({ code: 'auth/wrong-password' })));

    component.doLogin(noop, noop, noop, noop);
    expect(component.isLoading).toBeTrue();

    tick(2000);

    expect(component.isLoading).toBeFalse();
  }));

  // ─── onSignInClose ────────────────────────────────────────

  it('onSignInClose() → emits onClose event', () => {
    const closeSpy = spyOn(component.onClose, 'emit');
    component.onSignInClose();
    expect(closeSpy).toHaveBeenCalled();
  });
});
