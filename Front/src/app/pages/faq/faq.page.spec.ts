import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FAQPage } from './faq.page';
import { getCommonTestProviders } from '../../testing/test-utils';

describe('FAQPage', () => {
  let component: FAQPage;
  let fixture: ComponentFixture<FAQPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FAQPage],
      providers: getCommonTestProviders()
    }).compileComponents();

    fixture = TestBed.createComponent(FAQPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
