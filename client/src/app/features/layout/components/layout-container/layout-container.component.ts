import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { User } from '../../../../models/user.model';
import { AuthService } from '../../../../core/services/auth.service';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'tolla-layout-container',
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './layout-container.component.html',
  styleUrl: './layout-container.component.scss',
})
export class LayoutContainerComponent implements OnInit {
  private readonly authService: AuthService = inject(AuthService);
  private readonly router: Router = inject(Router);

  readonly userName = signal<string>('Operator');
  readonly isAuthenticated = signal<boolean>(false);
  readonly resultCount = signal<number | null>(null);

  ngOnInit(): void {
    this.bootstrapUser();
  }

  onSearch(term: string): void {
    void this.router.navigate(['/products'], {
      queryParams: term ? { search: term } : {},
      queryParamsHandling: 'merge',
    });
  }

  private bootstrapUser(): void {
    this.isAuthenticated.set(this.authService.isAuthenticated());

    if (!this.isAuthenticated()) {
      this.userName.set('Visitor');
      return;
    }

    const stored: User | null = this.authService.getStoredUser();

    if (stored?.name) {
      this.userName.set(stored.name);
    }

    this.authService.getCurrentUser().subscribe({
      next: (user: User) => this.userName.set(user.name),
    });
  }
}
