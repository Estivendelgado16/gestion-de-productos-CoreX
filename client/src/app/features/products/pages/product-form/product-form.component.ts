import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { CreateProductPayload, Product } from '../../../../models/product.model';
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
export class ProductFormComponent {
  private readonly productService: ProductService = inject(ProductService);
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
    categoryId: new FormControl<string>('', { nonNullable: true }),
  });

  readonly saving = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  onSave(): void {
    if (this.form.invalid || this.saving()) {
      return;
    }

    const payload: CreateProductPayload = {
      name: this.form.controls.name.value.trim(),
      price: this.form.controls.price.value,
      stock: this.form.controls.stock.value,
      categoryId: this.form.controls.categoryId.value,
    };

    const description = this.form.controls.description.value;
    if (description !== null && description.trim() !== '') {
      payload.description = description.trim();
    }

    this.saving.set(true);
    this.error.set(null);

    this.productService.createProduct(payload).subscribe({
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
