import { Component, EventEmitter, Output, effect, inject, input, signal } from '@angular/core';
import { DatePipe, UpperCasePipe } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {
  CreateCategoryPayload,
  Category,
  UpdateCategoryPayload,
} from '../../../../models/category.model';
import { CategoryService } from '../../../../services/category.service';

export type QuickEditTab = 'general' | 'seo' | 'access';
export type QuickEditMode = 'create' | 'edit';

interface GeneralForm {
  name: FormControl<string>;
  slug: FormControl<string>;
  description: FormControl<string | null>;
  status: FormControl<boolean>;
}

interface SeoForm {
  metaTitle: FormControl<string>;
  metaKeywords: FormControl<string>;
}

interface AccessForm {
  roles: FormControl<string[]>;
  owner: FormControl<string>;
}

interface QuickEditForm {
  general: FormGroup<GeneralForm>;
  seo: FormGroup<SeoForm>;
  access: FormGroup<AccessForm>;
}

@Component({
  selector: 'tolla-quick-edit-panel',
  imports: [ReactiveFormsModule, DatePipe, UpperCasePipe],
  templateUrl: './quick-edit-panel.component.html',
  styleUrl: './quick-edit-panel.component.scss',
})
export class QuickEditPanelComponent {
  private readonly categoryService: CategoryService = inject(CategoryService);

  readonly mode = input<QuickEditMode>('create');
  readonly category = input<Category | null>(null);

  @Output() saved = new EventEmitter<Category>();
  @Output() discard = new EventEmitter<void>();

  readonly activeTab = signal<QuickEditTab>('general');
  readonly saving = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly tabs: QuickEditTab[] = ['general', 'seo', 'access'];
  readonly tabLabels: Record<QuickEditTab, string> = {
    general: 'General',
    seo: 'SEO',
    access: 'Access Rules',
  };

  readonly form: FormGroup<QuickEditForm> = new FormGroup<QuickEditForm>({
    general: new FormGroup<GeneralForm>({
      name: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2)],
      }),
      slug: new FormControl<string>('', { nonNullable: true }),
      description: new FormControl<string | null>(null),
      status: new FormControl<boolean>(true, { nonNullable: true }),
    }),
    seo: new FormGroup<SeoForm>({
      metaTitle: new FormControl<string>('', { nonNullable: true }),
      metaKeywords: new FormControl<string>('', { nonNullable: true }),
    }),
    access: new FormGroup<AccessForm>({
      roles: new FormControl<string[]>(['admin', 'editor'], { nonNullable: true }),
      owner: new FormControl<string>('', { nonNullable: true }),
    }),
  });

  constructor() {
    effect(() => this.syncForm(this.category()));
  }

  setTab(tab: QuickEditTab): void {
    this.activeTab.set(tab);
  }

  isTab(tab: QuickEditTab): boolean {
    return this.activeTab() === tab;
  }

  onStatusToggle(): void {
    const current: boolean = this.form.controls.general.controls.status.value;
    this.form.controls.general.controls.status.setValue(!current);
  }

  onNameChange(): void {
    const name: string = this.form.controls.general.controls.name.value;
    const slug = this.form.controls.general.controls.slug;

    if (!slug.value || slug.value === this.slugify(this.category()?.name ?? '')) {
      slug.setValue(this.slugify(name));
    }
  }

  onSave(): void {
    if (this.form.invalid || this.saving()) {
      return;
    }

    const currentCategory: Category | null = this.category();
    const payload: CreateCategoryPayload | UpdateCategoryPayload =
      this.buildPayload(currentCategory);
    const request$ = currentCategory
      ? this.categoryService.updateCategory(currentCategory.id, payload)
      : this.categoryService.createCategory(payload as CreateCategoryPayload);

    this.saving.set(true);
    this.error.set(null);

    request$.subscribe({
      next: (savedCategory: Category) => {
        this.saving.set(false);
        this.saved.emit(savedCategory);
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.error.set(this.extractErrorMessage(err));
      },
    });
  }

  onDiscard(): void {
    this.error.set(null);
    this.syncForm(this.category());
    this.discard.emit();
  }

  private syncForm(category: Category | null): void {
    if (!category) {
      this.form.controls.general.reset({ name: '', slug: '', description: null, status: true });
      this.form.controls.seo.reset();
      this.form.controls.access.reset();
      this.activeTab.set('general');
      return;
    }

    this.form.controls.general.reset({
      name: category.name,
      slug: this.slugify(category.name),
      description: category.description,
      status: true,
    });
    this.form.controls.seo.reset();
    this.form.controls.access.reset();
    this.activeTab.set('general');
  }

  private buildPayload(currentCategory: Category | null): CreateCategoryPayload | UpdateCategoryPayload {
    const { name, description, status } = this.form.controls.general.controls;

    const payload: CreateCategoryPayload = {
      name: name.value.trim(),
    };

    if (description.value !== null && description.value.trim() !== '') {
      payload.description = description.value.trim();
    }

    if (currentCategory) {
      const update: UpdateCategoryPayload = {
        name: payload.name,
      };
      if (payload.description !== undefined) {
        update.description = payload.description;
      }
      return update;
    }

    return payload;
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private extractErrorMessage(err: unknown): string {
    if (typeof err === 'object' && err !== null && 'error' in err) {
      const errorValue = (err as { error?: { message?: string | string[] } }).error;
      if (errorValue?.message) {
        const message = errorValue.message;
        return Array.isArray(message) ? message.join(' · ') : message;
      }
    }
    if (typeof err === 'object' && err !== null && 'message' in err) {
      const message = (err as { message: string | string[] }).message;
      if (Array.isArray(message)) {
        return message.join(' · ');
      }
      if (typeof message === 'string') {
        return message;
      }
    }
    return 'An unexpected error occurred while saving the node.';
  }
}