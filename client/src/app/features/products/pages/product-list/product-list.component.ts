import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Product, ProductListResponse } from '../../../../models/product.model';
import { ProductService } from '../../../../services/product.service';

@Component({
  selector: 'tolla-product-list',
  imports: [RouterLink],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent implements OnInit {
  private readonly productService: ProductService = inject(ProductService);

  readonly products = signal<Product[]>([]);
  readonly totalProducts = signal<number>(0);
  readonly currentPage = signal<number>(1);
  readonly totalPages = signal<number>(1);
  readonly limit = signal<number>(10);
  readonly loading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadProducts();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages()) {
      return;
    }
    this.currentPage.set(page);
    this.loadProducts();
  }

  private loadProducts(): void {
    this.loading.set(true);

    this.productService
      .getProducts({ page: this.currentPage(), limit: this.limit() })
      .subscribe({
        next: (response: ProductListResponse) => {
          this.products.set(response.data);
          this.totalProducts.set(response.total);
          this.totalPages.set(response.totalPages);
          this.loading.set(false);
        },
        error: () => {
          this.products.set([]);
          this.totalProducts.set(0);
          this.totalPages.set(1);
          this.loading.set(false);
        },
      });
  }
}
