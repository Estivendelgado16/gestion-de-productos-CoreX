import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';
import { LoginModalService } from '../../../../core/services/login-modal.service';

interface LoginForm {
  name: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'tolla-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  private readonly authService: AuthService = inject(AuthService);
  private readonly loginModalService: LoginModalService = inject(LoginModalService);
  private readonly router: Router = inject(Router);

  readonly isRegistering = signal<boolean>(false);
  readonly submitting = signal<boolean>(false);
  readonly showPassword = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly form: FormGroup<LoginForm> = new FormGroup<LoginForm>({
    name: new FormControl<string>('', { nonNullable: true }),
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  ngOnInit(): void {
    this.syncNameValidators();
  }

  toggleMode(): void {
    this.isRegistering.update((value: boolean) => !value);
    this.error.set(null);
    this.updateNameValidation();
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((value: boolean) => !value);
  }

  private updateNameValidation(): void {
    const nameControl = this.form.controls.name;

    if (this.isRegistering()) {
      nameControl.setValidators([Validators.required, Validators.minLength(2)]);
    } else {
      nameControl.clearValidators();
    }

    nameControl.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.form.invalid || this.submitting()) {
      return;
    }

    const { name, email, password } = this.form.controls;
    const request$ = this.isRegistering()
      ? this.authService.register({
          name: name.value.trim(),
          email: email.value.trim(),
          password: password.value,
        })
      : this.authService.login({ email: email.value.trim(), password: password.value });

    this.submitting.set(true);
    this.error.set(null);

    request$.subscribe({
      next: () => {
        this.submitting.set(false);

        if (this.loginModalService.isOpen()) {
          this.loginModalService.close();
        }

        void this.router.navigate([
          this.authService.isAdmin() ? '/dashboard' : '/userProducts',
        ]);
      },
      error: (err: unknown) => {
        this.submitting.set(false);
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
    return 'Authentication failed. Please check your credentials.';
  }

  private syncNameValidators(): void {
    const nameControl = this.form.controls.name;

    if (this.isRegistering()) {
      nameControl.setValidators([Validators.required, Validators.minLength(2)]);
    } else {
      nameControl.clearValidators();
      nameControl.setValue('');
    }

    nameControl.updateValueAndValidity();
  }
}
