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
    title: ['', [Validators.required]],
    body: ['', [Validators.required, Validators.minLength(5)]],
  });

  modifiedArticle?: Products;
  selectedFile: File | null = null;
  imageSource: string = "";

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.route.params.subscribe((parameters) => {
      if (parameters['id'] !== undefined) {
        this.http
          .get<Products>('http://localhost:3000/article/' + parameters['id'])
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

  onAddArticle() {
    if (this.formulaire.valid) {
      if (this.modifiedArticle) {
        const formData: FormData = new FormData();

        formData.append('article', JSON.stringify(this.formulaire.value))
        if (this.selectedFile) {
          formData.append('file', this.selectedFile)
        }

        this.http
          .put(
            'http://localhost:3000/article/' + this.modifiedArticle.id,
            formData
          )
          .subscribe({
            next: (resultat) => this.router.navigateByUrl('/accueil'),
            error: (reponse) => alert(reponse.error),
          });
      } else {
        const formData: FormData = new FormData();

        formData.append('article', JSON.stringify(this.formulaire.value))
        if (this.selectedFile) {
          formData.append('file', this.selectedFile)
        }

        this.http
          .post('http://localhost:3000/article', formData)
          .subscribe({
            next: (result) => this.router.navigateByUrl('/accueil'),
            error: (error) => alert(error),
          });
      }
    }
  }

  onSelectedImage(file: File | null) {
    this.selectedFile = file;
  }
}
