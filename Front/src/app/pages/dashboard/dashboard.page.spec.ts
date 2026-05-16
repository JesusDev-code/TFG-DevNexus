import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DashboardPage } from './dashboard.page';
import { getCommonTestProviders } from '../../testing/test-utils';
import { AnimationController } from '@ionic/angular/standalone';

/**
 * Deep Dive: DashboardPage — Landing pública con panel de onboarding.
 *
 * El componente usa AnimationController de Ionic (no un overlay real),
 * por lo que mockeamos la cadena de animaciones para evitar que intenten
 * acceder al DOM real (nativeElement es undefined en tests headless).
 *
 * Limitación conocida: showOnBoardingToggle() y onMenuToggle() requieren
 * ViewChild refs (@ViewChild) que no existen en el TestBed headless
 * (nativeElement es undefined). Testeamos el estado booleano de las propiedades
 * sin ejecutar las animaciones.
 *
 * TODO: necesita spy de StatusBar (Capacitor) para tests más profundos de onMenuToggle
 */
describe('DashboardPage', () => {
  let component: DashboardPage;
  let fixture: ComponentFixture<DashboardPage>;

  // Mock de AnimationController: cadena fluent que no hace nada
  function crearAnimationMock() {
    const animMock: any = {
      create: () => animMock,
      addElement: () => animMock,
      fromTo: () => animMock,
      duration: () => animMock,
      easing: () => animMock,
      addAnimation: () => animMock,
      direction: () => animMock,
      play: () => Promise.resolve(),
    };
    return animMock;
  }

  const animCtrlMock = {
    create: () => crearAnimationMock()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [
        ...getCommonTestProviders(),
        { provide: AnimationController, useValue: animCtrlMock },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPage);
    component = fixture.componentInstance;
  });

  // ─── Creación ─────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ─── Estado inicial ──────────────────────────────────────────────────────

  it('estado inicial: showOnBoarding es false', () => {
    expect(component.showOnBoarding).toBeFalse();
  });

  it('estado inicial: isMenuOpen es true', () => {
    expect(component.isMenuOpen).toBeTrue();
  });

  it('estado inicial: showRiveMenuBtn es false (se pone true tras timeout)', () => {
    expect(component.showRiveMenuBtn).toBeFalse();
  });

  it('estado inicial: tabItems tiene elementos (cargados desde tabItemsList)', () => {
    expect(component.tabItems).toBeDefined();
    expect(component.tabItems.length).toBeGreaterThan(0);
  });

  it('estado inicial: selectedTab es el primer elemento de tabItemsList', () => {
    expect(component.selectedTab).toBeDefined();
    expect(component.selectedTab).toBe(component.tabItems[0]);
  });

  // ─── showOnBoardingToggle ────────────────────────────────────────────────

  it('showOnBoardingToggle alterna showOnBoarding', () => {
    expect(component.showOnBoarding).toBeFalse();

    // El método intenta acceder a nativeElement de ViewChild refs — en tests esos
    // son undefined. Wrapeamos para verificar el cambio booleano sin fallar.
    try { component.showOnBoardingToggle(); } catch { /* nativeElement undefined en tests */ }

    expect(component.showOnBoarding).toBeTrue();
  });

  it('showOnBoardingToggle hace toggle de vuelta a false en segundo call', () => {
    try { component.showOnBoardingToggle(); } catch { /* noop */ }
    try { component.showOnBoardingToggle(); } catch { /* noop */ }

    expect(component.showOnBoarding).toBeFalse();
  });

  // ─── onMenuToggle ────────────────────────────────────────────────────────

  it('onMenuToggle invierte isMenuOpen', () => {
    const estadoInicial = component.isMenuOpen;

    try { component.onMenuToggle(); } catch { /* nativeElement undefined en tests */ }

    expect(component.isMenuOpen).toBe(!estadoInicial);
  });
});
