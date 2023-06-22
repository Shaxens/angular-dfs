import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { getUserIdFromLocalStorage } from 'src/app/utils/auth.helper';

@Injectable()
export class WeeklyConsumptionResolver implements Resolve<any[]> {
  constructor(private http: HttpClient, private authService: AuthService) {}

  resolve(): Observable<any[]> {
    const userId = getUserIdFromLocalStorage();
    return this.http.get<any[]>(`http://localhost:3000/weekly-consumption?user_id=${userId}`);
  }
}
