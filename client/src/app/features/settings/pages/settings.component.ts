import { Component, inject, OnInit, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../models/user.model';
import { ChangePasswordPayload, UpdateProfilePayload } from '../../../models/auth.model';

interface SettingsProfileForm {
  name: FormControl<string>;
  email: FormControl<string>;
}

interface SettingsPasswordForm {
  currentPassword: FormControl<string>;
  newPassword: FormControl<string>;
  confirmPassword: FormControl<string>;
}

@Component({
  selector: 'tolla-settings',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, RouterLink],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit {
  private readonly authService = inject(AuthService);

  readonly user = signal<User | null>(null);
  readonly loading = signal<boolean>(true);
  readonly profileSaving = signal<boolean>(false);
  readonly passwordChanging = signal<boolean>(false);
  readonly profileError = signal<string | null>(null);
  readonly passwordError = signal<string | null>(null);
  readonly profileSuccess = signal<string | null>(null);
  readonly passwordSuccess = signal<string | null>(null);

  readonly profileForm: FormGroup<SettingsProfileForm> = new FormGroup<SettingsProfileForm>({
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });

  readonly passwordForm: FormGroup<SettingsPasswordForm> = new FormGroup<SettingsPasswordForm>({
    currentPassword: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
    newPassword: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
    confirmPassword: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  ngOnInit(): void {
    this.bootstrapUser();
    this.loadUser();
  }

  onSaveProfile(): void {
    if (this.profileForm.invalid || this.profileSaving()) {
      return;
    }

    const payload: UpdateProfilePayload = {
      name: this.profileForm.controls.name.value.trim(),
      email: this.profileForm.controls.email.value.trim(),
    };

    this.profileSaving.set(true);
    this.profileError.set(null);
    this.profileSuccess.set(null);

    this.authService.updateProfile(payload).subscribe({
      next: (user: User) => {
        this.user.set(user);
        this.profileSaving.set(false);
        this.profileSuccess.set('Profile updated successfully.');
      },
      error: (err: unknown) => {
        this.profileSaving.set(false);
        this.profileError.set(this.extractErrorMessage(err));
      },
    });
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid || this.passwordChanging()) {
      return;
    }

    const currentPassword = this.passwordForm.controls.currentPassword.value;
    const newPassword = this.passwordForm.controls.newPassword.value;
    const confirmPassword = this.passwordForm.controls.confirmPassword.value;

    if (newPassword !== confirmPassword) {
      this.passwordError.set('The new password and confirmation do not match.');
      return;
    }

    const payload: ChangePasswordPayload = {
      currentPassword,
      newPassword,
      confirmPassword,
    };

    this.passwordChanging.set(true);
    this.passwordError.set(null);
    this.passwordSuccess.set(null);

    this.authService.changePassword(payload).subscribe({
      next: () => {
        this.passwordChanging.set(false);
        this.passwordForm.reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
        this.passwordSuccess.set('Password changed successfully.');
      },
      error: (err: unknown) => {
        this.passwordChanging.set(false);
        this.passwordError.set(this.extractErrorMessage(err));
      },
    });
  }

  private bootstrapUser(): void {
    const stored = this.authService.getStoredUser();
    if (stored) {
      this.user.set(stored);
      this.profileForm.setValue({ name: stored.name, email: stored.email });
    }
  }

  private loadUser(): void {
    this.loading.set(true);
    this.profileError.set(null);

    this.authService.getCurrentUser().subscribe({
      next: (user: User) => {
        this.user.set(user);
        this.profileForm.setValue({ name: user.name, email: user.email });
        this.loading.set(false);
      },
      error: (_err: unknown) => {
        this.profileError.set('Unable to load profile information.');
        this.loading.set(false);
      },
    });
  }

  formatDate(value: string): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(value));
  }

  private extractErrorMessage(err: unknown): string {
    if (typeof err === 'object' && err !== null && 'error' in err) {
      const errorValue = (err as { error?: { message?: string | string[] } }).error;
      if (errorValue?.message) {
        const message = errorValue.message;
        return Array.isArray(message) ? message.join(' · ') : message;
      }
    }

    return 'An unexpected error occurred. Please try again.';
  }
}
