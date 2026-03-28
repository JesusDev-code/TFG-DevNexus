import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StaffInboxPage } from './staff-inbox.page';
import { getCommonTestProviders } from '../../../../testing/test-utils';

describe('StaffInboxPage', () => {
  let component: StaffInboxPage;
  let fixture: ComponentFixture<StaffInboxPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffInboxPage],
      providers: getCommonTestProviders()
    }).compileComponents();

    fixture = TestBed.createComponent(StaffInboxPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
