import { Component, inject, OnInit, signal } from '@angular/core';

import { getApiErrorMessage } from '../../../../core/utils/api-error-message';
import { FavoriteService } from '../../../../services/favorite.service';
import { Product } from '../../../../models/product.model';

@Component({
  selector: 'tolla-favorite-list',
  imports: [],
  templateUrl: './favorite-list.component.html',
  styleUrl: './favorite-list.component.scss',
})
export class FavoriteListComponent {
  private readonly favoriteService: FavoriteService = inject(FavoriteService);

  readonly favorites = signal<Product[]>([]);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadFavorites();
  }

  onRemove(productId: string): void {
    this.favoriteService.removeFavorite(productId).subscribe({
      next: () => this.loadFavorites(),
    });
  }

  private loadFavorites(): void {
    this.loading.set(true);
    this.error.set(null);

    this.favoriteService.getFavorites().subscribe({
      next: (products: Product[]) => {
        this.favorites.set(products);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.favorites.set([]);
        this.error.set(getApiErrorMessage(error, 'Unable to load favorites.'));
        this.loading.set(false);
      },
    });
  }
}
