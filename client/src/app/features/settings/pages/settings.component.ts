import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { AuthService } from '../../../core/services/auth.service';
import { ChangePasswordPayload } from '../../../models/auth.model';
import { User } from '../../../models/user.model';

interface PasswordFormControls {
  currentPassword: FormControl<string>;
  newPassword: FormControl<string>;
  confirmPassword: FormControl<string>;
}

@Component({
  selector: 'tolla-settings',
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit {
  private readonly authService: AuthService = inject(AuthService);

  readonly user = signal<User | null>(null);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly changingPassword = signal<boolean>(false);
  readonly passwordError = signal<string | null>(null);
  readonly passwordSuccess = signal<string | null>(null);

  readonly passwordForm: FormGroup<PasswordFormControls> = new FormGroup<PasswordFormControls>({
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
    const storedUser: User | null = this.authService.getStoredUser();

    if (storedUser) {
      this.user.set(storedUser);
    }

    this.authService.getCurrentUser().subscribe({
      next: (user: User) => {
        this.user.set(user);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('We could not load your profile information.');
      },
    });
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid || this.changingPassword()) {
      return;
    }

    const currentPassword: string = this.passwordForm.controls.currentPassword.value;
    const newPassword: string = this.passwordForm.controls.newPassword.value;
    const confirmPassword: string = this.passwordForm.controls.confirmPassword.value;

    this.passwordError.set(null);
    this.passwordSuccess.set(null);

    if (newPassword !== confirmPassword) {
      this.passwordError.set('The new password and confirmation do not match.');
      return;
    }

    const payload: ChangePasswordPayload = {
      currentPassword,
      newPassword,
    };

    this.changingPassword.set(true);

    this.authService.changePassword(payload).subscribe({
      next: () => {
        this.changingPassword.set(false);
        this.passwordForm.reset({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        this.passwordSuccess.set('Password updated successfully.');
      },
      error: (err: unknown) => {
        this.changingPassword.set(false);
        this.passwordError.set(this.extractErrorMessage(err));
      },
    });
  }

  private extractErrorMessage(err: unknown): string {
    if (typeof err === 'object' && err !== null && 'error' in err) {
      const errorValue = (err as { error?: { message?: string | string[] } }).error;
      if (errorValue?.message) {
        const message: string | string[] = errorValue.message;
        return Array.isArray(message) ? message.join(' - ') : message;
      }
    }

    return 'We could not update your password.';
  }
}
