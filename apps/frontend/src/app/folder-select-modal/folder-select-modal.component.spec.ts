import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FolderSelectModalComponent } from './folder-select-modal.component';

describe('FolderSelectModalComponent', () => {
  let component: FolderSelectModalComponent;
  let fixture: ComponentFixture<FolderSelectModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FolderSelectModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FolderSelectModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
