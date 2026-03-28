import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { SideMenuComponent } from './side-menu.component';
import { AuthService } from 'src/app/services/auth.service';
import { menuItemsList } from '../../models/side-menu';
import { NavController } from '@ionic/angular/standalone';
import { getCommonTestProviders } from '../../../../testing/test-utils';
import { of } from 'rxjs';

/**
 * Deep Dive: SideMenuComponent — Navigation + EventEmitter + Role-based routing.
 *
 * `onMenuItemPress` navega a la ruta del ítem y emite `closeMenuEvent`.
 * `goBack` hace logout → navigateRoot → emite closeMenuEvent.
 * `goToProfile` navega a /admin-profile o /user-profile según el rol.
 */
describe('SideMenuComponent', () => {
  let component: SideMenuComponent;
  let fixture: ComponentFixture<SideMenuComponent>;
  let navCtrlSpy: jasmine.SpyObj<NavController>;
  let authServiceMock: any;

  beforeEach(async () => {
    navCtrlSpy = jasmine.createSpyObj('NavController', ['navigateForward', 'navigateRoot']);

    authServiceMock = {
      currentUser: signal({ id: 1, nombre: 'Test User', email: 'test@test.com', rolNombre: 'USER', permiteContacto: true }),
      isAuthenticated: true,
      isAdmin: false,
      logout: jasmine.createSpy('logout').and.returnValue(of(void 0)),
      logoutNoRedirect: jasmine.createSpy().and.returnValue(of(void 0)),
      updateUserProfile: () => of({})
    };

    await TestBed.configureTestingModule({
      imports: [SideMenuComponent],
      providers: [
        ...getCommonTestProviders(),
        { provide: AuthService, useValue: authServiceMock },
        { provide: NavController, useValue: navCtrlSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SideMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ─── Creación ────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ─── menuItems ───────────────────────────────────────

  it('menuItems has the correct number of items from menuItemsList', () => {
    expect(component.menuItems.length).toBe(menuItemsList.length);
    expect(component.menuItems.length).toBeGreaterThan(0);
  });

  it('menuItems contain items with id and route', () => {
    const withRoute = component.menuItems.filter(m => m.route);
    expect(withRoute.length).toBeGreaterThan(0);
  });

  // ─── onMenuItemPress ─────────────────────────────────

  it('onMenuItemPress navigates to menu item route', () => {
    const item = component.menuItems.find(m => m.route)!;
    component.onMenuItemPress(0, item);

    expect(navCtrlSpy.navigateForward).toHaveBeenCalledWith(item.route!);
  });

  it('onMenuItemPress emits closeMenuEvent', () => {
    spyOn(component.closeMenuEvent, 'emit');

    const item = component.menuItems.find(m => m.route)!;
    component.onMenuItemPress(0, item);

    expect(component.closeMenuEvent.emit).toHaveBeenCalled();
  });

  // ─── goBack (logout) ─────────────────────────────────

  it('goBack calls authService.logout', () => {
    component.goBack();

    expect(authServiceMock.logout).toHaveBeenCalled();
  });

  it('goBack calls navigateRoot to /dashboard after logout', () => {
    component.goBack();

    expect(navCtrlSpy.navigateRoot).toHaveBeenCalledWith('/dashboard');
  });

  it('goBack emits closeMenuEvent', () => {
    spyOn(component.closeMenuEvent, 'emit');

    component.goBack();

    expect(component.closeMenuEvent.emit).toHaveBeenCalled();
  });

  // ─── goToProfile (role-based) ────────────────────────

  it('goToProfile navigates to /admin-profile for admin role', () => {
    authServiceMock.isAdmin = true;
    authServiceMock.currentUser = signal({ id: 1, nombre: 'Admin', email: 'admin@test.com', rolNombre: 'ADMIN', permiteContacto: true });

    component.goToProfile();

    expect(navCtrlSpy.navigateForward).toHaveBeenCalledWith('/admin-profile');
  });

  it('goToProfile navigates to /user-profile for user role', () => {
    authServiceMock.isAdmin = false;
    authServiceMock.currentUser = signal({ id: 1, nombre: 'User', email: 'user@test.com', rolNombre: 'USER', permiteContacto: true });

    component.goToProfile();

    expect(navCtrlSpy.navigateForward).toHaveBeenCalledWith('/user-profile');
  });
});
