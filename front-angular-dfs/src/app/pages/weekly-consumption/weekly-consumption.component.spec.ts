import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeeklyConsumptionComponent } from './weekly-consumption.component';

describe('WeeklyConsumptionComponent', () => {
  let component: WeeklyConsumptionComponent;
  let fixture: ComponentFixture<WeeklyConsumptionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WeeklyConsumptionComponent]
    });
    fixture = TestBed.createComponent(WeeklyConsumptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
