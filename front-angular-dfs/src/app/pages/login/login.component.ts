import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { getUserIdFromLocalStorage } from 'src/app/utils/auth.helper';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  formulaire: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  constructor(
    private formBuilder: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  onLogin() {
    if (this.formulaire.valid) {
      const credentials = {
        email: this.formulaire.value.email,
        password: this.formulaire.value.password,
        user_id: getUserIdFromLocalStorage() // Ajoutez cette ligne pour inclure user_id
      };
  
      this.auth.login(credentials).subscribe(success => {
        if (success) {
          this.router.navigateByUrl('/home')
        } else {
          alert("Mauvais login / mot de passe !")
        }
      });
    }
  }
  
  
}
