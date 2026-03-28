import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminMensajesPage } from './admin-mensajes.page';
import { getCommonTestProviders } from '../../../testing/test-utils';

describe('AdminMensajesPage', () => {
  let component: AdminMensajesPage;
  let fixture: ComponentFixture<AdminMensajesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminMensajesPage],
      providers: getCommonTestProviders()
    }).compileComponents();

    fixture = TestBed.createComponent(AdminMensajesPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
