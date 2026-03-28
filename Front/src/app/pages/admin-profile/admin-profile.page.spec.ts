import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminProfilePage } from './admin-profile.page';
import { getCommonTestProviders } from '../../testing/test-utils';

describe('AdminProfilePage', () => {
  let component: AdminProfilePage;
  let fixture: ComponentFixture<AdminProfilePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminProfilePage],
      providers: getCommonTestProviders()
    }).compileComponents();

    fixture = TestBed.createComponent(AdminProfilePage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
