import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Category } from '../../../../models/category.model';
import { KpiMetric } from '../../../../models/kpi.model';
import { Product, ProductListResponse } from '../../../../models/product.model';
import { CategoryService } from '../../../../services/category.service';
import { ProductService } from '../../../../services/product.service';
import { KpiGridComponent } from './components/metrics/kpi-grid/kpi-grid.component';

@Component({
  selector: 'tolla-dashboard',
  imports: [RouterLink, KpiGridComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly categoryService: CategoryService = inject(CategoryService);
  private readonly productService: ProductService = inject(ProductService);

  readonly categories = signal<Category[]>([]);
  readonly products = signal<Product[]>([]);
  readonly totalProducts = signal<number>(0);
  readonly loadingCategories = signal<boolean>(true);
  readonly loadingProducts = signal<boolean>(true);

  readonly kpis = computed<KpiMetric[]>(() => this.buildKpis());

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
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

    this.productService.getProducts({ limit: 100 }).subscribe({
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
        tooltip: 'Active categories',
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
