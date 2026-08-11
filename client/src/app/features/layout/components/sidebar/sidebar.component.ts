import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

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
  readonly items: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid', route: '/dashboard' },
    { id: 'products', label: 'Products', icon: 'box', route: '/products' },
    { id: 'categories', label: 'Categories', icon: 'network', route: '/categories' },
    { id: 'favorites', label: 'Favorites', icon: 'star', route: '/favorites' },
  ];
}
