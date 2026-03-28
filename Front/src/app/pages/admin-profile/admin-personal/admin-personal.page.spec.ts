import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminPersonalPage } from './admin-personal.page';
import { getCommonTestProviders } from '../../../testing/test-utils';

describe('AdminPersonalPage', () => {
  let component: AdminPersonalPage;
  let fixture: ComponentFixture<AdminPersonalPage>;

  beforeEach(async () => {
    const dummyTrigger = document.createElement('div');
    dummyTrigger.id = 'open-admin-avatar-selector';
    document.body.appendChild(dummyTrigger);

    await TestBed.configureTestingModule({
      imports: [AdminPersonalPage],
      providers: getCommonTestProviders()
    }).compileComponents();

    fixture = TestBed.createComponent(AdminPersonalPage);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    const trigger = document.getElementById('open-admin-avatar-selector');
    if (trigger) trigger.remove();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
