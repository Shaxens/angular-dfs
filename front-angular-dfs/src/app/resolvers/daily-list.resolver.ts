import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DailyList } from 'src/app/models/DailyList';
import { getUserIdFromLocalStorage } from '../utils/auth.helper';

@Injectable()
export class DailyListResolver implements Resolve<DailyList[]> {

  constructor(private http: HttpClient) {}

  resolve(route: ActivatedRouteSnapshot): Observable<DailyList[]> {
    const userId = getUserIdFromLocalStorage();
    return this.http.get<DailyList[]>('http://localhost:3000/daily-list?user_id=' + userId);
  }
  
}
