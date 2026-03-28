import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { OnBoardingPage } from './on-boarding.page';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { getCommonTestProviders } from '../../../../testing/test-utils';
import { of } from 'rxjs';

/**
 * Deep Dive: OnBoardingPage — Flow control + EventEmitter + AuthService integration.
 *
 * La page controla dos variables: `buttonToggle` (anima el botón de inicio)
 * y `showRiveAsset` (retrasa la carga del asset Rive).
 * `startCoursePressed` activa `buttonToggle`. `onSignInClose` lo resetea.
 * `onCloseOnBoarding` emite `closeOnBoardingEvent` para que el padre cierre el modal.
 * `goToProfile` navega a /user-profile.
 *
 * Estrategia: NO_ERRORS_SCHEMA para neutralizar Rive, IonModal y SignInComponent.
 */
describe('OnBoardingPage', () => {
  let component: OnBoardingPage;
  let fixture: ComponentFixture<OnBoardingPage>;
  let routerSpy: jasmine.SpyObj<Router>;
  let authServiceMock: any;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    authServiceMock = {
      currentUser: signal({ id: 1, nombre: 'Test User', email: 'test@test.com', rolNombre: 'USER', permiteContacto: true }),
      isAuthenticated: true,
      isAdmin: false,
      logout: () => of(void 0),
      updateUserProfile: () => of({})
    };

    await TestBed.configureTestingModule({
      imports: [OnBoardingPage],
      providers: [
        ...getCommonTestProviders(),
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(OnBoardingPage);
    component = fixture.componentInstance;
  });

  // ─── Creación ────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ─── Estado inicial ──────────────────────────────────

  it('initial state: buttonToggle is false', () => {
    expect(component.buttonToggle).toBeFalse();
  });

  it('initial state: showRiveAsset is false', () => {
    expect(component.showRiveAsset).toBeFalse();
  });

  // ─── startCoursePressed ──────────────────────────────

  it('startCoursePressed sets buttonToggle to true', () => {
    component.startCoursePressed();

    expect(component.buttonToggle).toBeTrue();
  });

  // ─── onSignInClose ───────────────────────────────────

  it('onSignInClose resets buttonToggle to false', () => {
    component.buttonToggle = true;

    component.onSignInClose();

    expect(component.buttonToggle).toBeFalse();
  });

  // ─── goToProfile ─────────────────────────────────────

  it('goToProfile navigates to /user-profile', () => {
    component.goToProfile();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/user-profile']);
  });

  // ─── onCloseOnBoarding ───────────────────────────────

  it('onCloseOnBoarding emits closeOnBoardingEvent', () => {
    const emitted: any[] = [];
    component.closeOnBoardingEvent.subscribe((v: any) => emitted.push(v));

    component.onCloseOnBoarding();

    expect(emitted.length).toBe(1);
  });

  // ─── authService integration ─────────────────────────

  it('authService is accessible from the component', () => {
    expect(component.authService).toBeTruthy();
    expect(component.authService.currentUser()).toBeTruthy();
  });
});
