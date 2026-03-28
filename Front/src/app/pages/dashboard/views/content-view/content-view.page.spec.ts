import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ContentViewPage } from './content-view.page';
import { getCommonTestProviders } from '../../../../testing/test-utils';

/**
 * Deep Dive: ContentViewPage — Static data + triggerOnboarding.
 *
 * La page tiene un array estático `cards` con 3 items y un método
 * `triggerOnboarding` que dispara un CustomEvent global.
 */
describe('ContentViewPage', () => {
  let component: ContentViewPage;
  let fixture: ComponentFixture<ContentViewPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentViewPage],
      providers: getCommonTestProviders(),
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ContentViewPage);
    component = fixture.componentInstance;
  });

  // ─── Creación ────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ─── cards ───────────────────────────────────────────

  it('cards array has exactly 3 items', () => {
    expect(component.cards.length).toBe(3);
  });

  it('cards items have required title, desc and icon properties', () => {
    component.cards.forEach(card => {
      expect(card.title).toBeTruthy();
      expect(card.desc).toBeTruthy();
      expect(card.icon).toBeTruthy();
    });
  });

  it('cards contain Documenta, Mentoría and Conecta entries', () => {
    const titles = component.cards.map(c => c.title);
    expect(titles).toContain('Documenta');
    expect(titles).toContain('Mentoría');
    expect(titles).toContain('Conecta');
  });

  // ─── triggerOnboarding ───────────────────────────────

  it('triggerOnboarding dispatches open-onboarding-modal event on window', () => {
    const events: Event[] = [];
    const listener = (e: Event) => events.push(e);
    window.addEventListener('open-onboarding-modal', listener);

    component.triggerOnboarding();

    expect(events.length).toBe(1);
    expect(events[0].type).toBe('open-onboarding-modal');

    window.removeEventListener('open-onboarding-modal', listener);
  });

  // ─── Lifecycle ───────────────────────────────────────

  it('renders without errors after detectChanges', () => {
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
