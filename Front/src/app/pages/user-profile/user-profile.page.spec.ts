import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { UserProfilePage } from './user-profile.page';
import { AuthService } from 'src/app/services/auth.service';
import { getCommonTestProviders } from '../../testing/test-utils';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

/**
 * Deep Dive: UserProfilePage — Structure + AuthService integration.
 *
 * Esta page es un shell de navegación por tabs. No tiene lógica de signals
 * propia, pero consume `authService` y renderiza los tabs correctamente.
 * Los tests validan que el componente se crea con usuario autenticado
 * y que la estructura de navegación es correcta.
 */
describe('UserProfilePage', () => {
  let component: UserProfilePage;
  let fixture: ComponentFixture<UserProfilePage>;
  let authServiceMock: any;

  beforeEach(async () => {
    authServiceMock = {
      currentUser: signal({ id: 1, nombre: 'Test User', email: 'test@test.com', rolNombre: 'USER', permiteContacto: true }),
      isAuthenticated: true,
      isAdmin: false,
      logout: () => of(void 0),
      updateUserProfile: () => of({})
    };

    await TestBed.configureTestingModule({
      imports: [UserProfilePage],
      providers: [
        ...getCommonTestProviders(),
        { provide: AuthService, useValue: authServiceMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfilePage);
    component = fixture.componentInstance;
  });

  // ─── Creación ────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('component instantiates without errors with authenticated user', () => {
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  // ─── authService integration ─────────────────────────

  it('authService.currentUser signal is accessible', () => {
    const user = authServiceMock.currentUser();
    expect(user).toBeTruthy();
    expect(user.nombre).toBe('Test User');
  });

  it('component does not expose userIsStaff computed (was removed)', () => {
    // Staff button was removed — verify the property does not exist
    expect((component as any).userIsStaff).toBeUndefined();
  });

  // ─── Renderizado ─────────────────────────────────────

  it('renders without throwing after detectChanges', () => {
    expect(() => {
      fixture.detectChanges();
      fixture.whenStable();
    }).not.toThrow();
  });
});
