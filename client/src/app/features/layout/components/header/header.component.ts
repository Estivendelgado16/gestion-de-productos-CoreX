import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { AuthService } from '../../../../core/services/auth.service';
import { LoginModalService } from '../../../../core/services/login-modal.service';

@Component({
  selector: 'tolla-header',
  imports: [ReactiveFormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private readonly authService: AuthService = inject(AuthService);
  private readonly loginModalService: LoginModalService = inject(LoginModalService);
  private readonly router: Router = inject(Router);

  @Input() userName: string = '';
  @Input() isAuthenticated: boolean = false;
  @Input() resultCount: number | null = null;
  @Output() searchChanged = new EventEmitter<string>();

  readonly searchControl: FormControl<string> = new FormControl<string>('', {
    nonNullable: true,
  });

  constructor() {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value: string) => this.searchChanged.emit(value));
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }

  onLogout(): void {
    if (!this.isAuthenticated) {
      this.loginModalService.open();
      return;
    }

    this.authService.logout().subscribe({
      next: () => {
        this.authService.clearSession();
        void this.router.navigate(['/publicCatalog']);
      },
      error: () => {
        this.authService.clearSession();
        void this.router.navigate(['/publicCatalog']);
      },
    });
  }

  onLogin(): void {
    this.loginModalService.open();
  }
}
