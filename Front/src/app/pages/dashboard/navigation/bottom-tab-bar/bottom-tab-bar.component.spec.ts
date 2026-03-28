import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BottomTabBarComponent } from './bottom-tab-bar.component';
import { BottomTabItem, tabItemsList } from '../../models/tabs';
import { getCommonTestProviders } from '../../../../testing/test-utils';

/**
 * Deep Dive: BottomTabBarComponent — Input/Output + tabItems array.
 *
 * `onIconPress` emite `onTabChange` solo cuando el tab presionado es DISTINTO
 * al tab actualmente seleccionado (`selectedTab`). Si es el mismo, no emite.
 * `trackTabItems` devuelve el id del tab para optimizar el *ngFor.
 */
describe('BottomTabBarComponent', () => {
  let component: BottomTabBarComponent;
  let fixture: ComponentFixture<BottomTabBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomTabBarComponent],
      providers: getCommonTestProviders(),
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(BottomTabBarComponent);
    component = fixture.componentInstance;
  });

  // ─── Creación ────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ─── tabItems ────────────────────────────────────────

  it('tabItems has the correct number of items', () => {
    expect(component.tabItems.length).toBe(tabItemsList.length);
    expect(component.tabItems.length).toBeGreaterThan(0);
  });

  it('tabItems contains items with required properties', () => {
    component.tabItems.forEach(tab => {
      expect(tab.id).toBeTruthy();
      expect(tab.stateMachine).toBeTruthy();
      expect(tab.artboard).toBeTruthy();
    });
  });

  // ─── onIconPress ─────────────────────────────────────

  it('onIconPress on a different tab emits onTabChange with that tab', () => {
    const tabs = component.tabItems;
    component.selectedTab = tabs[0]; // tab activo = primero

    const emitted: BottomTabItem[] = [];
    component.onTabChange.subscribe((tab: BottomTabItem) => emitted.push(tab));

    component.onIconPress(tabs[1]); // presionamos el segundo

    expect(emitted.length).toBe(1);
    expect(emitted[0].id).toBe(tabs[1].id);
  });

  it('onIconPress on the SAME tab does NOT emit onTabChange', () => {
    const tabs = component.tabItems;
    component.selectedTab = tabs[0];

    const emitted: BottomTabItem[] = [];
    component.onTabChange.subscribe((tab: BottomTabItem) => emitted.push(tab));

    component.onIconPress(tabs[0]); // mismo tab

    expect(emitted.length).toBe(0);
  });

  // ─── trackTabItems ───────────────────────────────────

  it('trackTabItems returns the tab id', () => {
    const tab = component.tabItems[0];
    const result = component.trackTabItems(0, tab);
    expect(result).toBe(tab.id);
  });

  // ─── selectedTab input ───────────────────────────────

  it('selectedTab defaults to first tabItem', () => {
    expect(component.selectedTab).toBe(component.tabItems[0]);
  });
});
