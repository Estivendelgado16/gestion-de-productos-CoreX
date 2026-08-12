import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { getApiErrorMessage } from '../../../../core/utils/api-error-message';
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
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);

  readonly products = signal<Product[]>([]);
  readonly totalProducts = signal<number>(0);
  readonly currentPage = signal<number>(1);
  readonly totalPages = signal<number>(1);
  readonly limit = signal<number>(10);
  readonly searchTerm = signal<string>('');
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.route.queryParams.subscribe(() => this.loadProducts());
  }

  onSearch(term: string): void {
    void this.router.navigate(['/products'], {
      queryParams: { search: term || null, page: 1 },
      queryParamsHandling: 'merge',
    });
  }

  onSearchInput(event: Event): void {
    this.onSearch((event.target as HTMLInputElement).value);
  }

  onClearSearch(): void {
    this.onSearch('');
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages()) {
      return;
    }
    this.currentPage.set(page);
    this.loadProducts();
  }

  private loadProducts(): void {
    const search = (this.route.snapshot.queryParamMap.get('search') ?? '').trim();
    const pageParam = Number(this.route.snapshot.queryParamMap.get('page')) || 1;

    this.searchTerm.set(search);
    this.currentPage.set(pageParam);
    this.loading.set(true);
    this.error.set(null);

    this.productService
      .getProducts({ search: search || undefined, page: pageParam, limit: this.limit() })
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

