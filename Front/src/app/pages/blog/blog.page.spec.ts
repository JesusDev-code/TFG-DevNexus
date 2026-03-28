import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BlogPage } from './blog.page';
import { getCommonTestProviders } from '../../testing/test-utils';

describe('BlogPage', () => {
  let component: BlogPage;
  let fixture: ComponentFixture<BlogPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogPage],
      providers: getCommonTestProviders()
    }).compileComponents();

    fixture = TestBed.createComponent(BlogPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
