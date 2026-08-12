import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { getApiErrorMessage } from '../../../../core/utils/api-error-message';
import {
  Category,
  CreateCategoryPayload,
} from '../../../../models/category.model';
import { CategoryService } from '../../../../services/category.service';

interface CategoryFormControls {
  name: FormControl<string>;
  description: FormControl<string | null>;
}

@Component({
  selector: 'tolla-category-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.scss',
})
export class CategoryFormComponent implements OnInit {
  private readonly categoryService: CategoryService = inject(CategoryService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);

  readonly isEdit = signal<boolean>(false);
  readonly loading = signal<boolean>(false);
  readonly saving = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly form: FormGroup<CategoryFormControls> = new FormGroup<CategoryFormControls>({
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    description: new FormControl<string | null>(null),
  });

  private categoryId: string | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEdit.set(true);
      this.categoryId = id;
      this.loadCategory(id);
    }
  }

  onSave(): void {
    if (this.form.invalid || this.saving()) {
      return;
    }

    const payload: CreateCategoryPayload = {
      name: this.form.controls.name.value.trim(),
    };
    const description = this.form.controls.description.value;
    if (description !== null && description.trim() !== '') {
      payload.description = description.trim();
    }

    this.saving.set(true);
    this.error.set(null);

    const request$ = this.isEdit() && this.categoryId
      ? this.categoryService.updateCategory(this.categoryId, payload)
      : this.categoryService.createCategory(payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        void this.router.navigate(['/categories'], {
          queryParams: { saved: this.isEdit() ? 'updated' : 'created' },
        });
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.error.set(getApiErrorMessage(err, 'Unable to save the category.'));
      },
    });
  }

  private loadCategory(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.categoryService.getCategoryById(id).subscribe({
      next: (category: Category) => {
        this.form.controls.name.setValue(category.name);
        this.form.controls.description.setValue(category.description);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.error.set(getApiErrorMessage(err, 'Unable to load the category.'));
        this.loading.set(false);
      },
    });
  }
}