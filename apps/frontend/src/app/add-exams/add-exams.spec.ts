import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddExams } from './add-exams';

describe('AddExams', () => {
  let component: AddExams;
  let fixture: ComponentFixture<AddExams>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddExams],
    }).compileComponents();

    fixture = TestBed.createComponent(AddExams);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
