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
  readonly success = signal<string | null>(null);
  readonly deletingProductId = signal<string | null>(null);
  readonly productPendingDelete = signal<Product | null>(null);

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

  onProductEdit(product: Product): void {
    void this.router.navigate(['/products', product.id, 'edit']);
  }

  requestProductDelete(product: Product): void {
    if (this.deletingProductId()) {
      return;
    }

    this.productPendingDelete.set(product);
    this.error.set(null);
  }

  cancelProductDelete(): void {
    if (this.deletingProductId()) {
      return;
    }

    this.productPendingDelete.set(null);
  }

  confirmProductDelete(): void {
    const product = this.productPendingDelete();

    if (!product || this.deletingProductId()) {
      return;
    }

    this.deletingProductId.set(product.id);
    this.error.set(null);
    this.success.set(null);

    this.productService.deleteProduct(product.id).subscribe({
      next: () => {
        this.products.update((products: Product[]) =>
          products.filter((item: Product) => item.id !== product.id),
        );
        this.totalProducts.update((total: number) => {
          const nextTotal = Math.max(total - 1, 0);
          this.totalPages.set(Math.max(Math.ceil(nextTotal / this.limit()), 1));
          return nextTotal;
        });
        this.success.set('Producto eliminado correctamente.');
        this.deletingProductId.set(null);
        this.productPendingDelete.set(null);
      },
      error: (error: unknown) => {
        this.error.set(getApiErrorMessage(error, 'No se pudo eliminar el producto.'));
        this.deletingProductId.set(null);
      },
    });
  }

  formatPrice(price: number): string {
    return formatPrice(price);
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

