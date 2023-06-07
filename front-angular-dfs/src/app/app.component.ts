import { Component } from '@angular/core';
import { Jwt } from './models/Jwt';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  jwt: Jwt | null = null;

  constructor(private auth: AuthService) {
    this.auth.$jwt.subscribe((jwt) => this.jwt = jwt);
  }

  onLogout() {
    this.auth.logout();
  }
}
