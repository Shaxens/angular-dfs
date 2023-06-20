import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { DailyList } from 'src/app/models/DailyList';
import { Jwt } from 'src/app/models/Jwt';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-daily-list',
  templateUrl: './daily-list.component.html',
  styleUrls: ['./daily-list.component.scss']
})
export class DailyListComponent {

  dailyList: DailyList[] = [];
  filename: File | null = null;

  jwt: Jwt | null = null;

  constructor(private http: HttpClient, private auth: AuthService) {
    this.refresh();
    this.auth.$jwt.subscribe((jwt) => (this.jwt = jwt));
  }

  refresh() {
    this.http
      .get<DailyList[]>('http://localhost:3000/daily-list')
      .subscribe((dailyList) => (this.dailyList = dailyList));
  }

  onDeleteList(id: number) {
    this.http.delete('http://localhost:3000/daily-list/' + id).subscribe({
      next: (result) => this.refresh(),
      error: (error) => alert(JSON.stringify(error)),
    });
  }
}
