import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Jwt } from '../models/Jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  $jwt: BehaviorSubject<Jwt | null> = new BehaviorSubject<Jwt | null>(null)

  constructor(private http: HttpClient) {
    this.readJwtLocalStorage();
  }

  login(user: { email: string; password: string }): Observable<boolean> {

    return new Observable<boolean> (resolve => {
      this.http.post('http://localhost:3000/login', user).subscribe({
        next: (response: any) => {
          localStorage.setItem('jwt', response.token);
          this.readJwtLocalStorage();
          resolve.next(true);
          resolve.complete();
        },
        error: () => {
          resolve.next(false);
          resolve.complete();
        }
      });
    })
  }

  readJwtLocalStorage() {
    const jwt = localStorage.getItem('jwt');

    if (jwt != null) {
      const base64 = jwt.split('.')[1];
      const dataJson = window.atob(base64);
      const utilisateurJwt = JSON.parse(dataJson);
      this.$jwt.next(utilisateurJwt)
    } else {
      this.$jwt.next(null)
    }
  }

  logout() {
    localStorage.removeItem("jwt");
    this.$jwt.next(null);
  }

  signup(user: { email: string; password: string }): Observable<boolean> {

    return new Observable<boolean> (resolve => {
      this.http.post('http://localhost:3000/signup', user).subscribe({
        next: (response: any) => {
          localStorage.setItem('jwt', response.token);
          this.readJwtLocalStorage();
          resolve.next(true);
          resolve.complete();
        },
        error: () => {
          resolve.next(false);
          resolve.complete();
        }
      });
    })
  }

}
