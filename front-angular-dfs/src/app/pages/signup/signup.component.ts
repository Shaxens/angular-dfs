import { Component } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {

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
      this.auth.signup(this.formulaire.value).subscribe(success => {
        if (success) {
          this.router.navigateByUrl('/login')
        } else {
          alert("Une erreur est survenue lors de la création de votre compte")
        }
      })
    }
  }
}
