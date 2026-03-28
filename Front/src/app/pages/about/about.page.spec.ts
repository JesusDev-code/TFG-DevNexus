import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SobreNosotrosPage } from './about.page';
import { getCommonTestProviders } from '../../testing/test-utils';

describe('SobreNosotrosPage', () => {
  let component: SobreNosotrosPage;
  let fixture: ComponentFixture<SobreNosotrosPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SobreNosotrosPage],
      providers: getCommonTestProviders()
    }).compileComponents();

    fixture = TestBed.createComponent(SobreNosotrosPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
