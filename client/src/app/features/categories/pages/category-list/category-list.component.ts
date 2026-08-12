import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { getApiErrorMessage } from '../../../../core/utils/api-error-message';
import { Category } from '../../../../models/category.model';
import { CategoryService } from '../../../../services/category.service';
import { CategoryGridComponent } from '../../components/category-grid/category-grid/category-grid.component';

@Component({
  selector: 'tolla-category-list',
  imports: [CategoryGridComponent, RouterLink],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.scss',
})
export class CategoryListComponent implements OnInit {
  private readonly categoryService: CategoryService = inject(CategoryService);
  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  readonly categories = signal<Category[]>([]);
  readonly loading = signal<boolean>(true);
  readonly loadError = signal<string | null>(null);
  readonly success = signal<string | null>(null);

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

  onCategoryDelete(category: Category): void {
    this.categoryService.deleteCategory(category.id).subscribe({
      next: () => {
        this.success.set('Category deleted successfully.');
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
}