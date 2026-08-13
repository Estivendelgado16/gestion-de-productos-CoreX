import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {
  CreateProductPayload,
  Product,
  UpdateProductPayload,
} from '../../../../models/product.model';
import { formatPrice } from '../../../../core/utils/format-price';
import { Category } from '../../../../models/category.model';
import { CategoryService } from '../../../../services/category.service';
import { ProductService } from '../../../../services/product.service';

interface ProductFormControls {
  name: FormControl<string>;
  description: FormControl<string | null>;
  price: FormControl<number>;
  stock: FormControl<number>;
  categoryId: FormControl<string>;
}

@Component({
  selector: 'tolla-product-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss',
})
export class ProductFormComponent implements OnInit {
  private readonly categoryService: CategoryService = inject(CategoryService);
  private readonly productService: ProductService = inject(ProductService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);

  readonly form: FormGroup<ProductFormControls> = new FormGroup<ProductFormControls>({
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    description: new FormControl<string | null>(null),
    price: new FormControl<number>(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
    stock: new FormControl<number>(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
    categoryId: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  readonly categories = signal<Category[]>([]);
  readonly isEdit = signal<boolean>(false);
  readonly loadingProduct = signal<boolean>(false);
  readonly loadingCategories = signal<boolean>(true);
  readonly categoryError = signal<string | null>(null);
  readonly saving = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  private productId: string | null = null;

  ngOnInit(): void {
    this.bootstrapEditMode();

    if (!this.isEdit()) {
      this.loadCategories();
    } else {
      this.loadingCategories.set(false);
    }
  }

  onSave(): void {
    if (this.form.invalid || this.saving()) {
      return;
    }

    const payload: CreateProductPayload | UpdateProductPayload = {
      name: this.form.controls.name.value.trim(),
      price: this.form.controls.price.value,
      stock: this.form.controls.stock.value,
    };

    if (!this.isEdit()) {
      payload.categoryId = this.form.controls.categoryId.value.trim();
    }

    const description = this.form.controls.description.value;
    if (description !== null && description.trim() !== '') {
      payload.description = description.trim();
    }

    this.saving.set(true);
    this.error.set(null);

    const request$ = this.isEdit() && this.productId
      ? this.productService.updateProduct(this.productId, payload)
      : this.productService.createProduct(payload as CreateProductPayload);

    request$.subscribe({
      next: (_product: Product) => {
        this.saving.set(false);
        void this.router.navigate(['/products']);
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.error.set(this.extractErrorMessage(err));
      },
    });
  }

  getFormattedPrice(): string {
    return formatPrice(this.form.controls.price.value);
  }

  private bootstrapEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      return;
    }

    this.productId = id;
    this.isEdit.set(true);
    this.loadProduct(id);
  }

  private loadProduct(id: string): void {
    this.loadingProduct.set(true);
    this.error.set(null);

    this.productService.getProductById(id).subscribe({
      next: (product: Product) => {
        this.form.setValue({
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          categoryId: product.categoryId,
        });
        this.loadingProduct.set(false);
      },
      error: (err: unknown) => {
        this.error.set(this.extractErrorMessage(err));
        this.loadingProduct.set(false);
      },
    });
  }

  private loadCategories(): void {
    this.loadingCategories.set(true);
    this.categoryError.set(null);

    this.categoryService.getCategories().subscribe({
      next: (categories: Category[]) => {
        this.categories.set(categories);
        this.loadingCategories.set(false);
      },
      error: () => {
        this.categories.set([]);
        this.categoryError.set('Unable to load categories.');
        this.loadingCategories.set(false);
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
    return 'An unexpected error occurred while saving the product.';
  }
}
