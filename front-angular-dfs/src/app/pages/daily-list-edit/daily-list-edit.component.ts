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
    product: ['', Validators.required]
  });

  modifiedArticle?: DailyList;
  existingProducts: Products[] = [];
  selectedProduct: number | null = null;

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
              this.formulaire.patchValue(result);
              this.modifiedArticle = result;
            },
            error: (response) => alert(response.error),
          });
      }
      this.http.get<Products[]>('http://localhost:3000/products').subscribe((products) => {
        this.existingProducts = products;
      });
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.http.get<DailyList>('http://localhost:3000/daily-list/' + id).subscribe({
      next: (result) => {
        this.modifiedArticle = result;
        this.selectedProduct = result.product_id;
        this.formulaire.patchValue({ product: this.selectedProduct });
      },
      error: (response) => alert(response.error),
    });
  
    this.http.get<Products[]>('http://localhost:3000/products').subscribe((products) => {
      this.existingProducts = products;
    });
  }

  getProductDetails(productId: number): Products | undefined {
    return this.existingProducts.find(product => product.id === productId);
  }

  onProductChange(productId: number) {
    this.selectedProduct = productId;
  }

  onSubmit() {
    const id = this.route.snapshot.params['id'];
    const selectedProductId = this.selectedProduct;
    const updatedData = {
      product_id: selectedProductId
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
