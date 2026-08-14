import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'tolla-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  private readonly authService: AuthService = inject(AuthService);

  private readonly adminItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid', route: '/dashboard' },
    { id: 'products', label: 'Products', icon: 'box', route: '/products' },
    { id: 'categories', label: 'Categories', icon: 'network', route: '/categories' },
    { id: 'settings', label: 'Settings', icon: 'cog', route: '/settings' },
  ];

  private readonly userItems: SidebarItem[] = [
    { id: 'userProducts', label: 'Products', icon: 'box', route: '/userProducts' },
    { id: 'userFavoritos', label: 'Favoritos', icon: 'star', route: '/userFavoritos' },
    { id: 'settings', label: 'Settings', icon: 'cog', route: '/settings' },
  ];

  get items(): SidebarItem[] {
    return this.authService.isAdmin() ? this.adminItems : this.userItems;
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
}