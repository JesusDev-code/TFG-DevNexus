import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminEventosPage } from './admin-eventos.page';
import { getCommonTestProviders } from '../../../testing/test-utils';

describe('AdminEventosPage', () => {
  let component: AdminEventosPage;
  let fixture: ComponentFixture<AdminEventosPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminEventosPage],
      providers: getCommonTestProviders()
    }).compileComponents();

    fixture = TestBed.createComponent(AdminEventosPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
