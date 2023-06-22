import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { DailyList } from 'src/app/models/DailyList';
import { Jwt } from 'src/app/models/Jwt';
import { AuthService } from 'src/app/services/auth.service';
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'app-daily-list',
  templateUrl: './daily-list.component.html',
  styleUrls: ['./daily-list.component.scss']
})
export class DailyListComponent {

  dailyList: DailyList[] = [];

  jwt: Jwt | null = null;

  constructor(private http: HttpClient, private auth: AuthService, private jwtHelper: JwtHelperService) {
    this.auth.$jwt.subscribe((jwt) => (this.jwt = jwt));
  }

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    const jwt = localStorage.getItem('jwt');

    if (!jwt) {
      console.log("Erreur lors de la récupération du jwt")
      return;
    }

    const decodedToken = this.jwtHelper.decodeToken(jwt);
    const userId = decodedToken.user_id;
    if (!userId) {
      console.log("Erreur lors de la récupération de l'id utilisateur")
      return;
    }

    this.http
      .get<DailyList[]>(`http://localhost:3000/daily-list?user_id=${userId}`)
      .subscribe((dailyList) => (this.dailyList = dailyList));
  }


  onDeleteList(id: number) {
    this.http.delete('http://localhost:3000/daily-list/' + id).subscribe({
      next: (result) => this.refresh(),
      error: (error) => alert(JSON.stringify(error)),
    });
  }
}
