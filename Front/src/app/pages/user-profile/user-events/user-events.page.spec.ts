import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserEventsPage } from './user-events.page';
import { getCommonTestProviders } from '../../../testing/test-utils';

describe('UserEventsPage', () => {
  let component: UserEventsPage;
  let fixture: ComponentFixture<UserEventsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserEventsPage],
      providers: getCommonTestProviders()
    }).compileComponents();

    fixture = TestBed.createComponent(UserEventsPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
