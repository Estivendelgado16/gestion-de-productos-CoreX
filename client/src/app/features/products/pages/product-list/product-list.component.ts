import { Category } from '../../../../models/category.model';
import { CategoryService } from '../../../../services/category.service';

import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { getApiErrorMessage } from '../../../../core/utils/api-error-message';
import { formatPrice } from '../../../../core/utils/format-price';
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
  private readonly categoryService: CategoryService = inject(CategoryService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);

  readonly products = signal<Product[]>([]);
  readonly totalProducts = signal<number>(0);
  readonly currentPage = signal<number>(1);
  readonly totalPages = signal<number>(1);
  readonly limit = signal<number>(10);
  readonly searchTerm = signal<string>('');
  readonly loading = signal<boolean>(true);
  readonly selectedCategoryId = signal<string>('');
  readonly categories = signal<Category[]>([]);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly deletingProductId = signal<string | null>(null);
  readonly productPendingDelete = signal<Product | null>(null);

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages()) {
      return;
    }
    this.currentPage.set(page);
    this.loadProducts();
  }

  onCategoryChange(categoryId: string): void {
    this.selectedCategoryId.set(categoryId);
    this.currentPage.set(1);
    this.loadProducts();
  }

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.currentPage.set(1);
    this.loadProducts();
  }

  private loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (cats: Category[]) => this.categories.set(cats),
      error: () => this.categories.set([]),
    });
  }

  private loadProducts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.productService
      .getProducts({
        page: this.currentPage(),
        limit: this.limit(),
        search: this.searchTerm() || undefined,
        categoryId: this.selectedCategoryId() || undefined,
      })
      .subscribe({
        next: (response: ProductListResponse) => {
          this.products.set(response.data);
          this.totalProducts.set(response.total);
          this.totalPages.set(response.totalPages);
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.products.set([]);
          this.totalProducts.set(0);
          this.totalPages.set(1);
          this.error.set(getApiErrorMessage(error, 'Unable to load products.'));
          this.loading.set(false);
        },
      });
  }
}

