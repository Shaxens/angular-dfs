import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyListEditComponent } from './daily-list-edit.component';

describe('DailyListEditComponent', () => {
  let component: DailyListEditComponent;
  let fixture: ComponentFixture<DailyListEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DailyListEditComponent]
    });
    fixture = TestBed.createComponent(DailyListEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
