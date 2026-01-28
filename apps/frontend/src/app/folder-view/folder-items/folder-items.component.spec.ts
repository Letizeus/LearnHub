import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FolderItemsComponent } from './folder-items.component';

describe('FolderItemsComponent', () => {
  let component: FolderItemsComponent;
  let fixture: ComponentFixture<FolderItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FolderItemsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FolderItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
