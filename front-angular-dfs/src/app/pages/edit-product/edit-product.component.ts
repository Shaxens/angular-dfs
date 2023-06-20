import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Products } from 'src/app/models/Products';

@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.scss']
})
export class EditProductComponent {
  formulaire: FormGroup = this.formBuilder.group({
    name: ['', [Validators.required]],
    lipid: ['', [Validators.required, Validators.maxLength(5)]],
    carbohydrate: ['', [Validators.required, Validators.maxLength(5)]],
    protein: ['', [Validators.required, Validators.maxLength(5)]],
  });

  calories: number = 0;
  
  calculCalories() {
    this.calories = ((this.formulaire.value.lipid * 9) + (this.formulaire.value.carbohydrate * 4) + (this.formulaire.value.protein * 4));
    console.log(this.calories)
    return this.calories;
  }


  modifiedArticle?: Products;
  selectedFile: File | null = null;
  imageSource: string = "";

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.calculCalories()
    this.route.params.subscribe((parameters) => {
      if (parameters['id'] !== undefined) {
        this.http
          .get<Products>('http://localhost:3000/product/' + parameters['id'])
          .subscribe({
            next: (result) => {
              this.formulaire.patchValue(result),
                (this.modifiedArticle = result);
                if (result.filename) {
                  this.imageSource
                }
            },
            error: (response) => alert(response.error),
          });
      }
    });
  }

  onAddProduct() {
    if (this.formulaire.valid) {
      if (this.modifiedArticle) {
        const formData: FormData = new FormData();
        const productData = {...this.formulaire.value, calories: this.calculCalories()}
        formData.append('product', JSON.stringify(productData))

        this.http
          .put(
            'http://localhost:3000/product/' + this.modifiedArticle.id,
            formData
          )
          .subscribe({
            next: (resultat) => this.router.navigateByUrl('/home'),
            error: (reponse) => alert(reponse.error),
          });
      } else {
        const formData: FormData = new FormData();

        const productData = {...this.formulaire.value, calories: this.calculCalories()}
        formData.append('product', JSON.stringify(productData))


        this.http
          .post('http://localhost:3000/product', formData)
          .subscribe({
            next: (result) => this.router.navigateByUrl('/home'),
            error: (error) => alert(error),
          });
      }
    }
  }

  onSelectedImage(file: File | null) {
    this.selectedFile = file;
  }


}
