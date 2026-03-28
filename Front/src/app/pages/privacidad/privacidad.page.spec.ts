import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrivacidadPage } from './privacidad.page';
import { getCommonTestProviders } from '../../testing/test-utils';

describe('PrivacidadPage', () => {
  let component: PrivacidadPage;
  let fixture: ComponentFixture<PrivacidadPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacidadPage],
      providers: getCommonTestProviders()
    }).compileComponents();

    fixture = TestBed.createComponent(PrivacidadPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
