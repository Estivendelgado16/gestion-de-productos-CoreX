import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { getApiErrorMessage } from '../../../../core/utils/api-error-message';
import { Category } from '../../../../models/category.model';
import { CategoryService } from '../../../../services/category.service';

interface CategoryFormControls {
  name: FormControl<string>;
  description: FormControl<string | null>;
}

@Component({
  selector: 'tolla-category-list',
  imports: [ReactiveFormsModule],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.scss',
})
export class CategoryListComponent {
  private readonly categoryService: CategoryService = inject(CategoryService);

  readonly categories = signal<Category[]>([]);
  readonly loading = signal<boolean>(true);
  readonly creating = signal<boolean>(false);
  readonly saving = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly loadError = signal<string | null>(null);

  readonly form: FormGroup<CategoryFormControls> = new FormGroup<CategoryFormControls>({
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    description: new FormControl<string | null>(null),
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  toggleCreate(): void {
    this.creating.set(!this.creating());
    this.error.set(null);
    this.form.reset({ name: '', description: null });
  }

  onSave(): void {
    if (this.form.invalid || this.saving()) {
      return;
    }

    const payload: { name: string; description?: string } = {
      name: this.form.controls.name.value.trim(),
    };
    const description = this.form.controls.description.value;
    if (description !== null && description.trim() !== '') {
      payload.description = description.trim();
    }

    this.saving.set(true);
    this.error.set(null);

    this.categoryService.createCategory(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.creating.set(false);
        this.form.reset({ name: '', description: null });
        this.loadCategories();
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.error.set(this.extractErrorMessage(err));
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

  private extractErrorMessage(err: unknown): string {
    if (typeof err === 'object' && err !== null && 'error' in err) {
      const errorValue = (err as { error?: { message?: string | string[] } }).error;
      if (errorValue?.message) {
        const message = errorValue.message;
        return Array.isArray(message) ? message.join(' · ') : message;
      }
    }
    return 'An unexpected error occurred while saving the category.';
  }
}
