import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { getApiErrorMessage } from '../../../../core/utils/api-error-message';
import { formatPrice } from '../../../../core/utils/format-price';
import { Category } from '../../../../models/category.model';
import { Product, ProductListResponse } from '../../../../models/product.model';
import { CategoryService } from '../../../../services/category.service';
import { ProductService } from '../../../../services/product.service';
import { CategoryGridComponent } from '../../components/category-grid/category-grid/category-grid.component';

@Component({
  selector: 'tolla-category-list',
  imports: [CategoryGridComponent, RouterLink],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.scss',
})
export class CategoryListComponent implements OnInit {
  private readonly categoryService: CategoryService = inject(CategoryService);
  private readonly productService: ProductService = inject(ProductService);
  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  readonly categories = signal<Category[]>([]);
  readonly selectedCategory = signal<Category | null>(null);
  readonly categoryProducts = signal<Product[]>([]);
  readonly totalCategoryProducts = signal<number>(0);
  readonly loading = signal<boolean>(true);
  readonly loadingProducts = signal<boolean>(false);
  readonly loadError = signal<string | null>(null);
  readonly productsError = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly deletingProductId = signal<string | null>(null);
  readonly productPendingDelete = signal<Product | null>(null);

  ngOnInit(): void {
    this.showSavedMessage();
    this.clearSavedQuery();
    this.loadCategories();
  }

  private showSavedMessage(): void {
    const saved = this.route.snapshot.queryParamMap.get('saved');

    if (saved === 'created') {
      this.success.set('Category created successfully.');
    } else if (saved === 'updated') {
      this.success.set('Category updated successfully.');
    }
  }

  private clearSavedQuery(): void {
    if (this.route.snapshot.queryParamMap.has('saved')) {
      void this.router.navigate([], {
        replaceUrl: true,
        queryParams: {},
      });
    }
  }

  onCreate(): void {
    void this.router.navigate(['/categories/new']);
  }

  onCategoryEdit(category: Category): void {
    void this.router.navigate(['/categories', category.id, 'edit']);
  }

  onCategorySelect(category: Category): void {
    this.selectedCategory.set(category);
    this.loadProductsByCategory(category.id);
  }

  onBackToCategories(): void {
    this.selectedCategory.set(null);
    this.categoryProducts.set([]);
    this.totalCategoryProducts.set(0);
    this.productsError.set(null);
    this.loadingProducts.set(false);
  }

  formatPrice(price: number): string {
    return formatPrice(price);
  }

  requestProductDelete(product: Product): void {
    if (this.deletingProductId()) {
      return;
    }

    this.productPendingDelete.set(product);
    this.productsError.set(null);
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
    this.productsError.set(null);
    this.success.set(null);

    this.productService.deleteProduct(product.id).subscribe({
      next: () => {
        this.categoryProducts.update((products: Product[]) =>
          products.filter((item: Product) => item.id !== product.id),
        );
        this.totalCategoryProducts.update((total: number) => Math.max(total - 1, 0));
        this.success.set('Producto eliminado correctamente.');
        this.deletingProductId.set(null);
        this.productPendingDelete.set(null);
      },
      error: (error: unknown) => {
        this.productsError.set(getApiErrorMessage(error, 'No se pudo eliminar el producto.'));
        this.deletingProductId.set(null);
      },
    });
  }

  onCategoryDelete(category: Category): void {
    this.categoryService.deleteCategory(category.id).subscribe({
      next: () => {
        this.success.set('Category deleted successfully.');
        if (this.selectedCategory()?.id === category.id) {
          this.selectedCategory.set(null);
          this.categoryProducts.set([]);
          this.totalCategoryProducts.set(0);
        }
        this.loadCategories();
      },
      error: (error: unknown) => {
        this.loadError.set(getApiErrorMessage(error, 'Unable to delete category.'));
      },
    });
  }

  private loadCategories(): void {
    this.loading.set(true);
    this.loadError.set(null);

    this.categoryService.getCategories().subscribe({
      next: (categories: Category[]) => {
        this.categories.set(categories);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.categories.set([]);
        this.loadError.set(getApiErrorMessage(error, 'Unable to load categories.'));
        this.loading.set(false);
      },
    });
  }

  private loadProductsByCategory(categoryId: string): void {
    this.loadingProducts.set(true);
    this.productsError.set(null);
    this.categoryProducts.set([]);
    this.totalCategoryProducts.set(0);

    this.productService.getProducts({ categoryId, page: 1, limit: 100 }).subscribe({
      next: (response: ProductListResponse) => {
        this.categoryProducts.set(response.data);
        this.totalCategoryProducts.set(response.total);
        this.loadingProducts.set(false);
      },
      error: (error: unknown) => {
        this.productsError.set(getApiErrorMessage(error, 'Unable to load category products.'));
        this.loadingProducts.set(false);
      },
    });
  }
}
