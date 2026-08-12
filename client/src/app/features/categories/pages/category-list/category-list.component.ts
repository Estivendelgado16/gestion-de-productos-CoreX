import { Component, inject, OnInit, signal } from '@angular/core';

import { getApiErrorMessage } from '../../../../core/utils/api-error-message';
import { Category } from '../../../../models/category.model';
import { CategoryService } from '../../../../services/category.service';
import { CategoryGridComponent } from '../../components/category-grid/category-grid/category-grid.component';
import {
  QuickEditMode,
  QuickEditPanelComponent,
} from '../../components/quick-edit/quick-edit-panel.component';

@Component({
  selector: 'tolla-category-list',
  imports: [CategoryGridComponent, QuickEditPanelComponent],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.scss',
})
export class CategoryListComponent implements OnInit {
  private readonly categoryService: CategoryService = inject(CategoryService);

  readonly categories = signal<Category[]>([]);
  readonly loading = signal<boolean>(true);
  readonly loadError = signal<string | null>(null);
  readonly success = signal<string | null>(null);

  readonly quickEditOpen = signal<boolean>(false);
  readonly quickEditMode = signal<QuickEditMode>('create');
  readonly selectedCategory = signal<Category | null>(null);

  ngOnInit(): void {
    this.loadCategories();
  }

  onCreate(): void {
    this.quickEditMode.set('create');
    this.selectedCategory.set(null);
    this.quickEditOpen.set(true);
  }

  onCategoryEdit(category: Category): void {
    this.quickEditMode.set('edit');
    this.selectedCategory.set(category);
    this.quickEditOpen.set(true);
  }

  onNodeSaved(_savedCategory: Category): void {
    this.quickEditOpen.set(false);
    this.selectedCategory.set(null);
    this.success.set('Category saved successfully.');
    this.loadCategories();
  }

  onDiscard(): void {
    this.quickEditOpen.set(false);
    this.selectedCategory.set(null);
  }


  onCategoryDelete(categoryId: string): void {
    this.categoryService.deleteCategory(categoryId).subscribe({
      next: () => this.loadCategories(),
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