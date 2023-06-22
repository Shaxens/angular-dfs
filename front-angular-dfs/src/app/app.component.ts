import { Component } from '@angular/core';
import { Jwt } from './models/Jwt';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  jwt: Jwt | null = null;

  constructor(private auth: AuthService, private router: Router) {
    this.auth.$jwt.subscribe((jwt) => this.jwt = jwt);
  }

  onLogout() {
    this.auth.logout();
    this.router.navigateByUrl('/login')
  }
}
