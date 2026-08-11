import { Component, computed, inject, OnInit, signal } from '@angular/core';

import { AuthService } from '../../../core/services/auth.service';
import { Category } from '../../../models/category.model';
import { KpiMetric } from '../../../models/kpi.model';
import { Product, ProductListResponse } from '../../../models/product.model';
import { User } from '../../../models/user.model';
import { CategoryService } from '../../../services/category.service';
import { ProductService } from '../../../services/product.service';
import { LayoutContainerComponent } from '../components/layout/layout-container.component';
import { KpiGridComponent } from '../components/metrics/kpi-grid.component';
import { OntologyListComponent } from '../components/ontology/ontology-list.component';
import {
  QuickEditMode,
  QuickEditPanelComponent,
} from '../components/quick-edit/quick-edit-panel.component';

@Component({
  selector: 'tolla-dashboard',
  imports: [
    LayoutContainerComponent,
    KpiGridComponent,
    OntologyListComponent,
    QuickEditPanelComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly categoryService: CategoryService = inject(CategoryService);
  private readonly productService: ProductService = inject(ProductService);
  private readonly authService: AuthService = inject(AuthService);

  readonly userName = signal<string>('Operator');
  readonly categories = signal<Category[]>([]);
  readonly products = signal<Product[]>([]);
  readonly totalProducts = signal<number>(0);
  readonly loadingCategories = signal<boolean>(true);
  readonly loadingProducts = signal<boolean>(true);
  readonly searchTerm = signal<string>('');

  readonly quickEditOpen = signal<boolean>(false);
  readonly quickEditMode = signal<QuickEditMode>('create');
  readonly selectedCategory = signal<Category | null>(null);

  readonly kpis = computed<KpiMetric[]>(() => this.buildKpis());

  ngOnInit(): void {
    this.bootstrapUser();
    this.loadCategories();
    this.loadProducts();
  }

  onSearch(term: string): void {
    this.searchTerm.set(term.trim());
    this.loadProducts();
  }

  onNavSelected(_section: string): void {
    // Navigation hooks for future sections (catalog, favorites, analytics, settings).
  }

  onCategorySelected(category: Category): void {
    this.openQuickEdit(category);
  }

  onCategoryEdit(category: Category): void {
    this.openQuickEdit(category);
  }

  onCreateNode(): void {
    this.quickEditMode.set('create');
    this.selectedCategory.set(null);
    this.quickEditOpen.set(true);
  }

  onNodeSaved(_savedCategory: Category): void {
    this.quickEditOpen.set(false);
    this.selectedCategory.set(null);
    this.loadCategories();
    this.loadProducts();
  }

  onDiscard(): void {
    this.quickEditOpen.set(false);
    this.selectedCategory.set(null);
  }

  onCategoryDelete(category: Category): void {
    this.categoryService.deleteCategory(category.id).subscribe({
      next: () => this.loadCategories(),
    });
  }

  private openQuickEdit(category: Category): void {
    this.quickEditMode.set('edit');
    this.selectedCategory.set(category);
    this.quickEditOpen.set(true);
  }

  private bootstrapUser(): void {
    const stored: User | null = this.authService.getStoredUser();

    if (stored?.name) {
      this.userName.set(stored.name);
    }

    this.authService.getCurrentUser().subscribe({
      next: (user: User) => this.userName.set(user.name),
    });
  }

  private loadCategories(): void {
    this.loadingCategories.set(true);

    this.categoryService.getCategories().subscribe({
      next: (categories: Category[]) => {
        this.categories.set(categories);
        this.loadingCategories.set(false);
      },
      error: () => {
        this.categories.set([]);
        this.loadingCategories.set(false);
      },
    });
  }

  private loadProducts(): void {
    this.loadingProducts.set(true);

    this.productService
      .getProducts({ search: this.searchTerm() || undefined, limit: 10 })
      .subscribe({
        next: (response: ProductListResponse) => {
          this.products.set(response.data);
          this.totalProducts.set(response.total);
          this.loadingProducts.set(false);
        },
        error: () => {
          this.products.set([]);
          this.totalProducts.set(0);
          this.loadingProducts.set(false);
        },
      });
  }

  private buildKpis(): KpiMetric[] {
    const categories: Category[] = this.categories();
    const products: Product[] = this.products();

    return [
      {
        id: 'total-categories',
        label: 'Total Categories',
        value: categories.length.toString(),
        delta: 8.4,
        deltaLabel: 'vs last week',
        tone: 'cyan',
        icon: '▦',
        tooltip: 'Active ontology nodes',
      },
      {
        id: 'sku-count',
        label: 'SKU Count',
        value: this.totalProducts().toString(),
        delta: 12.1,
        deltaLabel: 'vs last week',
        tone: 'magenta',
        icon: '▣',
        tooltip: 'Total product SKUs',
      },
      {
        id: 'revenue',
        label: 'Revenue',
        value: this.formatCompactCurrency(products),
        delta: 5.6,
        deltaLabel: 'vs last week',
        tone: 'purple',
        icon: '◈',
        tooltip: 'Estimated value (price × stock)',
      },
      {
        id: 'uncategorized',
        label: 'Uncategorized',
        value: this.countUncategorized(products).toString(),
        delta: -3.2,
        deltaLabel: 'vs last week',
        tone: 'amber',
        icon: '▲',
        tooltip: 'Products missing a category',
      },
    ];
  }

  private formatCompactCurrency(products: Product[]): string {
    const revenue: number = products.reduce(
      (acc: number, product: Product) => acc + product.price * product.stock,
      0,
    );
    const formatted: string = new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(revenue);

    return `$${formatted}`;
  }

  private countUncategorized(products: Product[]): number {
    return products.filter((product: Product) => !product.categoryId).length;
  }
}