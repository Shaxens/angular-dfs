import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Products } from 'src/app/models/Products';
import { Jwt } from 'src/app/models/Jwt';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  listeArticle: Products[] = [];

  jwt: Jwt | null = null;

  constructor(private http: HttpClient, private auth: AuthService) {
    this.refresh();
    this.auth.$jwt.subscribe((jwt) => (this.jwt = jwt));
  }

  refresh() {
    this.http
      .get<Products[]>('http://localhost:3000/products')
      .subscribe((listeArticle) => (this.listeArticle = listeArticle));
  }

  onDeleteArticle(id: number) {
    this.http.delete('http://localhost:3000/product/' + id).subscribe({
      next: (result) => this.refresh(),
      error: (error) => alert(error),
    });
  }
}
