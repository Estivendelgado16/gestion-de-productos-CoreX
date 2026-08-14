import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { getApiErrorMessage } from '../../core/utils/api-error-message';
import { formatPrice } from '../../core/utils/format-price';
import { Product, ProductListResponse } from '../../models/product.model';
import { FavoriteService } from '../../services/favorite.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'tolla-user-products',
  imports: [],
  templateUrl: './user-products.component.html',
  styleUrl: './user-products.component.scss',
})
export class UserProductsComponent implements OnInit {
  private readonly productService: ProductService = inject(ProductService);
  private readonly favoriteService: FavoriteService = inject(FavoriteService);
  private readonly authService: AuthService = inject(AuthService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);

  readonly products = signal<Product[]>([]);
  readonly totalProducts = signal<number>(0);
  readonly currentPage = signal<number>(1);
  readonly totalPages = signal<number>(1);
  readonly limit = signal<number>(12);
  readonly searchTerm = signal<string>('');
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly favoriteIds = signal<Set<string>>(new Set<string>());

  ngOnInit(): void {
    this.loadFavorites();
    this.route.queryParams.subscribe(() => this.loadProducts());
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  isFavorite(productId: string): boolean {
    return this.favoriteIds().has(productId);
  }

  toggleFavorite(product: Product): void {
    const isFavorite = this.isFavorite(product.id);
    const request$: Observable<Product | void> = isFavorite
      ? this.favoriteService.removeFavorite(product.id)
      : this.favoriteService.addFavorite(product.id);

    request$.subscribe({
      next: () => {
        this.favoriteIds.update((ids: Set<string>) => {
          const next = new Set<string>(ids);
          if (isFavorite) {
            next.delete(product.id);
          } else {
            next.add(product.id);
          }
          return next;
        });
      },
      error: (error: unknown) => {
        this.error.set(
          getApiErrorMessage(
            error,
            isFavorite
              ? 'No se pudo quitar el producto de favoritos.'
              : 'No se pudo agregar el producto a favoritos.',
          ),
        );
      },
    });
  }

  formatPrice(price: number): string {
    return formatPrice(price);
  }

  onSearch(term: string): void {
    void this.router.navigate(['/userProducts'], {
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

  private loadFavorites(): void {
    this.favoriteService.getFavorites().subscribe({
      next: (favorites: Product[]) =>
        this.favoriteIds.set(new Set<string>(favorites.map((product) => product.id))),
      error: () => this.favoriteIds.set(new Set<string>()),
    });
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