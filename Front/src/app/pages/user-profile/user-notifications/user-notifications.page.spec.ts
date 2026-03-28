import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserNotificationsPage } from './user-notifications.page';
import { getCommonTestProviders } from '../../../testing/test-utils';

describe('UserNotificationsPage', () => {
  let component: UserNotificationsPage;
  let fixture: ComponentFixture<UserNotificationsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserNotificationsPage],
      providers: getCommonTestProviders()
    }).compileComponents();

    fixture = TestBed.createComponent(UserNotificationsPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
