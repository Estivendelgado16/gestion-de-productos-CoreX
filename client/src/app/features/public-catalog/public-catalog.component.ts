import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { LoginModalService } from '../../core/services/login-modal.service';
import { getApiErrorMessage } from '../../core/utils/api-error-message';
import { formatPrice } from '../../core/utils/format-price';
import { LoginModalComponent } from '../auth/components/login-modal/login-modal.component';
import { Product, ProductListResponse } from '../../models/product.model';
import { FavoriteService } from '../../services/favorite.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'tolla-public-catalog',
  imports: [LoginModalComponent],
  templateUrl: './public-catalog.component.html',
  styleUrl: './public-catalog.component.scss',
})
export class PublicCatalogComponent implements OnInit {
  private readonly productService: ProductService = inject(ProductService);
  private readonly favoriteService: FavoriteService = inject(FavoriteService);
  private readonly authService: AuthService = inject(AuthService);
  private readonly loginModalService: LoginModalService = inject(LoginModalService);

  readonly products = signal<Product[]>([]);
  readonly totalProducts = signal<number>(0);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly favoriteIds = signal<Set<string>>(new Set<string>());
  readonly pendingFavorite = signal<Product | null>(null);

  constructor() {
    effect(() => {
      if (!this.loginModalService.isOpen() && this.authService.isAuthenticated()) {
        const pending: Product | null = this.pendingFavorite();
        if (pending) {
          this.pendingFavorite.set(null);
          this.addFavorite(pending);
        }
        this.loadFavorites();
      }
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  openLoginModal(): void {
    this.loginModalService.open();
  }

  isFavorite(productId: string): boolean {
    return this.favoriteIds().has(productId);
  }

  toggleFavorite(product: Product): void {
    if (!this.requireAuthentication(product)) {
      return;
    }

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

  private addFavorite(product: Product): void {
    this.favoriteService.addFavorite(product.id).subscribe({
      next: () => {
        this.favoriteIds.update((ids: Set<string>) => {
          const next = new Set<string>(ids);
          next.add(product.id);
          return next;
        });
      },
      error: (error: unknown) => {
        this.error.set(
          getApiErrorMessage(error, 'No se pudo agregar el producto a favoritos.'),
        );
      },
    });
  }

  formatPrice(price: number): string {
    return formatPrice(price);
  }

  private requireAuthentication(product: Product): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }

    this.pendingFavorite.set(product);
    this.loginModalService.open();
    return false;
  }

  private loadFavorites(): void {
    this.favoriteService.getFavorites().subscribe({
      next: (favorites: Product[]) =>
        this.favoriteIds.set(new Set<string>(favorites.map((product) => product.id))),
      error: () => this.favoriteIds.set(new Set<string>()),
    });
  }

  private loadProducts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.productService.getProducts().subscribe({
      next: (response: ProductListResponse) => {
        this.products.set(response.data);
        this.totalProducts.set(response.total);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.products.set([]);
        this.totalProducts.set(0);
        this.error.set(getApiErrorMessage(error, 'No se pudieron cargar los productos.'));
        this.loading.set(false);
      },
    });
  }
}