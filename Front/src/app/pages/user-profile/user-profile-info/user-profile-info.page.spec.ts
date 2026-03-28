import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { UserProfileInfoPage } from './user-profile-info.page';
import { AuthService } from 'src/app/services/auth.service';
import { getCommonTestProviders } from '../../../testing/test-utils';
import { of } from 'rxjs';

/**
 * Deep Dive: UserProfileInfoPage — Form population + Avatar flow + guardarCambios.
 *
 * Estrategia:
 * - La page usa `authService.currentUser()` en ngOnInit para popular `formData`.
 * - El flujo de avatar tiene 3 pasos: iniciarSeleccionAvatar → seleccionarAvatar → confirmarAvatar.
 * - `guardarCambios` valida nombre y llama a `authService.updateUserProfile`.
 */
describe('UserProfileInfoPage', () => {
  let component: UserProfileInfoPage;
  let fixture: ComponentFixture<UserProfileInfoPage>;
  let authServiceMock: any;

  const MOCK_USER = {
    id: 1,
    nombre: 'Test User',
    email: 'test@test.com',
    rolNombre: 'USER',
    permiteContacto: true,
    biografia: 'Dev frontend',
    foto_perfil: 'assets/avatars/avatar1.png',
    motivoNoContacto: '',
    departamentoId: 2
  };

  beforeEach(async () => {
    authServiceMock = {
      currentUser: signal(MOCK_USER),
      isAuthenticated: true,
      isAdmin: false,
      logout: () => of(void 0),
      updateUserProfile: jasmine.createSpy('updateUserProfile').and.returnValue(of({}))
    };

    // Required for IonModal trigger
    const dummyTrigger = document.createElement('div');
    dummyTrigger.id = 'open-avatar-selector';
    document.body.appendChild(dummyTrigger);

    await TestBed.configureTestingModule({
      imports: [UserProfileInfoPage],
      providers: [
        ...getCommonTestProviders(),
        { provide: AuthService, useValue: authServiceMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfileInfoPage);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    const trigger = document.getElementById('open-avatar-selector');
    if (trigger) trigger.remove();
  });

  // ─── Creación ────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ─── Form population from currentUser ────────────────

  it('cargarDatosUsuario populates formData from currentUser signal', () => {
    component.cargarDatosUsuario();

    expect(component.formData.nombre).toBe(MOCK_USER.nombre);
    expect(component.formData.email).toBe(MOCK_USER.email);
    expect(component.formData.biografia).toBe(MOCK_USER.biografia);
    expect(component.formData.foto_perfil).toBe(MOCK_USER.foto_perfil);
    expect(component.formData.permiteContacto).toBe(MOCK_USER.permiteContacto);
    expect(component.formData.departamentoId).toBe(MOCK_USER.departamentoId);
  });

  it('cargarDatosUsuario sets inicial to first letter of nombre uppercased', () => {
    component.cargarDatosUsuario();

    expect(component.inicial).toBe('T'); // 'Test User' → 'T'
  });

  // ─── Avatar selection flow ───────────────────────────

  it('iniciarSeleccionAvatar copies foto_perfil to avatarTemporal', () => {
    component.formData.foto_perfil = 'assets/avatars/avatar3.png';
    component.avatarTemporal = '';

    component.iniciarSeleccionAvatar();

    expect(component.avatarTemporal).toBe('assets/avatars/avatar3.png');
  });

  it('seleccionarAvatar updates ONLY avatarTemporal, NOT formData.foto_perfil', () => {
    component.formData.foto_perfil = 'assets/avatars/avatar1.png';
    component.avatarTemporal = 'assets/avatars/avatar1.png';

    component.seleccionarAvatar('assets/avatars/avatar5.png');

    expect(component.avatarTemporal).toBe('assets/avatars/avatar5.png');
    expect(component.formData.foto_perfil).toBe('assets/avatars/avatar1.png'); // no cambia
  });

  it('confirmarAvatar commits avatarTemporal to formData.foto_perfil and dismisses modal', () => {
    const modalMock = { dismiss: jasmine.createSpy('dismiss') };
    component.avatarTemporal = 'assets/avatars/avatar6.png';
    component.formData.foto_perfil = 'assets/avatars/avatar1.png';

    component.confirmarAvatar(modalMock);

    expect(component.formData.foto_perfil).toBe('assets/avatars/avatar6.png');
    expect(modalMock.dismiss).toHaveBeenCalled();
  });

  // ─── guardarCambios ──────────────────────────────────

  it('guardarCambios with empty nombre does NOT call updateUserProfile', async () => {
    component.formData.nombre = '   '; // solo espacios

    await component.guardarCambios();

    expect(authServiceMock.updateUserProfile).not.toHaveBeenCalled();
  });

  it('guardarCambios with valid nombre calls updateUserProfile', async () => {
    component.formData.nombre = 'Nuevo Nombre';

    await component.guardarCambios();

    expect(authServiceMock.updateUserProfile).toHaveBeenCalled();
  });

  // ─── getIconoRol ─────────────────────────────────────

  it('getIconoRol returns desktop-outline for frontend role', () => {
    expect(component.getIconoRol('Frontend Developer')).toBe('desktop-outline');
  });

  it('getIconoRol returns server-outline for backend role', () => {
    expect(component.getIconoRol('Backend Engineer')).toBe('server-outline');
  });

  it('getIconoRol returns layers-outline for fullstack role', () => {
    expect(component.getIconoRol('Fullstack Dev')).toBe('layers-outline');
  });

  it('getIconoRol returns code-slash-outline as fallback', () => {
    expect(component.getIconoRol('Designer')).toBe('code-slash-outline');
  });
});
