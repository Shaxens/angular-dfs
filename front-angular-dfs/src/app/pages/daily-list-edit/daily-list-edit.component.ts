import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DailyList } from 'src/app/models/DailyList';
import { Products } from 'src/app/models/Products';

@Component({
  selector: 'app-daily-list-edit',
  templateUrl: './daily-list-edit.component.html',
  styleUrls: ['./daily-list-edit.component.scss']
})
export class DailyListEditComponent {
  formulaire: FormGroup = this.formBuilder.group({
    product: ['', Validators.required],
    calories: ['', Validators.required]
  });

  modifiedArticle?: DailyList;
  existingProducts: Products[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.route.params.subscribe((parameters) => {
      if (parameters['id'] !== undefined) {
        this.http
          .get<DailyList>('http://localhost:3000/daily-list/' + parameters['id'])
          .subscribe({
            next: (result) => {
              this.formulaire.patchValue(result),
                (this.modifiedArticle = result);
            },
            error: (response) => alert(response.error),
          });
      }
      this.http.get<Products[]>('http://localhost:3000/products').subscribe((products) => {
        this.existingProducts = products;
      });
    });
  }

  onSubmit() {
          console.log('Modification réussie !');
    const id = this.route.snapshot.params['id'];
    const updatedData = {
      product: this.formulaire.value.product.name,
      calories: this.formulaire.value.product.calories
    };
  
    this.http.put(`http://localhost:3000/daily-list/${id}`, updatedData)
      .subscribe({
        next: (response) => {
          console.log('Modification réussie !');
          this.router.navigateByUrl('/daily-list');
        },
        error: (response) => {
          console.error('Erreur lors de la modification :', response);
          alert(response.error);
        }
      });
  }
  
  
  

  onCancel() {
    this.formulaire.reset();
    this.router.navigateByUrl('/daily-list');
  }
}
