import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';

import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'tolla-settings',
  imports: [DatePipe],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit {
  private readonly authService: AuthService = inject(AuthService);

  readonly user = signal<User | null>(null);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

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
}
