import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { getApiErrorMessage } from '../../core/utils/api-error-message';
import { formatPrice } from '../../core/utils/format-price';
import { Category } from '../../models/category.model';
import { Product, ProductListResponse } from '../../models/product.model';
import { CategoryService } from '../../services/category.service';
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
  private readonly categoryService: CategoryService = inject(CategoryService);
  private readonly authService: AuthService = inject(AuthService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);

  readonly products = signal<Product[]>([]);
  readonly totalProducts = signal<number>(0);
  readonly searchTerm = signal<string>('');
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly favoriteIds = signal<Set<string>>(new Set<string>());
  readonly categories = signal<Category[]>([]);
  readonly selectedCategoryName = signal<string>('');
  readonly visibleCategoryCount = 10;
  readonly carouselIndex = signal<number>(0);

  readonly uniqueCategories = computed<Category[]>(() => {
    const seen = new Set<string>();
    return this.categories().filter((category) => {
      const key = category.name.trim().toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  });

  readonly visibleCategories = computed<Category[]>(() => {
    const cats = this.uniqueCategories();
    const n = cats.length;

    if (n <= this.visibleCategoryCount) {
      return cats;
    }

    const start = this.carouselIndex();
    return Array.from({ length: this.visibleCategoryCount }, (_, i) => cats[(start + i) % n]);
  });

  ngOnInit(): void {
    this.loadCategories();
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
      queryParams: { search: term || null },
      queryParamsHandling: 'merge',
    });
  }

  onSearchInput(event: Event): void {
    this.onSearch((event.target as HTMLInputElement).value);
  }

  onClearSearch(): void {
    this.onSearch('');
  }

  toggleCategory(categoryName: string): void {
    this.selectedCategoryName.update((current) =>
      current.toLowerCase() === categoryName.toLowerCase() ? '' : categoryName,
    );
    this.loadProducts();
  }

  nextCategories(): void {
    const n = this.uniqueCategories().length;
    if (n <= this.visibleCategoryCount) {
      return;
    }
    this.carouselIndex.update((index) => (index + this.visibleCategoryCount) % n);
  }

  prevCategories(): void {
    const n = this.uniqueCategories().length;
    if (n <= this.visibleCategoryCount) {
      return;
    }
    this.carouselIndex.update((index) => (index - this.visibleCategoryCount + n) % n);
  }

  private loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (cats: Category[]) => this.categories.set(cats),
      error: () => this.categories.set([]),
    });
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

    this.searchTerm.set(search);
    this.loading.set(true);
    this.error.set(null);

    this.productService
      .getProducts({
        search: search || undefined,
        categoryName: this.selectedCategoryName() || undefined,
        limit: 1000,
      })
      .subscribe({
        next: (response: ProductListResponse) => {
          this.products.set(response.data);
          this.totalProducts.set(response.total);
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.products.set([]);
          this.totalProducts.set(0);
          this.error.set(getApiErrorMessage(error, 'Unable to load products.'));
          this.loading.set(false);
        },
      });
  }
}