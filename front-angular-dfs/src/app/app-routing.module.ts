import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { authGuard } from './services/auth.guard';
import { SignupComponent } from './pages/signup/signup.component';
import { EditProductComponent } from './pages/edit-product/edit-product.component';
import { DailyListComponent } from './pages/daily-list/daily-list.component';
import { DailyListEditComponent } from './pages/daily-list-edit/daily-list-edit.component';
import { DailyListResolver } from './resolvers/daily-list.resolver';
import { WeeklyConsumptionComponent } from './pages/weekly-consumption/weekly-consumption.component';
import { WeeklyConsumptionResolver } from './resolvers/weekly-consumption.resolver';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'daily-list',
    component: DailyListComponent,
    canActivate: [authGuard],
    resolve: { dailyList: DailyListResolver }
  },
  {
    path: 'modify-list/:id',
    component: DailyListEditComponent,
    canActivate: [authGuard],
  },
  {
    path: 'add-product',
    component: EditProductComponent,
    canActivate: [authGuard],
  },
  { path: 'modify-product/:id', component: EditProductComponent },
  { 
    path: 'weekly-consumption',
    component: WeeklyConsumptionComponent,
    canActivate: [authGuard],
    resolve: { weeklyData: WeeklyConsumptionResolver }
  },
  { path: 'signup', component: SignupComponent },
  { path: '*', redirectTo: 'login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
