import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./features/layout/components/layout-container/layout-container.component').then(
        (m) => m.LayoutContainerComponent,
      ),
    children: [
      {
        path: 'dashboard',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/products/pages/product-list/product-list.component').then(
            (m) => m.ProductListComponent,
          ),
      },
      {
        path: 'products/new',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/products/pages/product-form/product-form.component').then(
            (m) => m.ProductFormComponent,
          ),
      },
      {
        path: 'products/:id/edit',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/products/pages/product-form/product-form.component').then(
            (m) => m.ProductFormComponent,
          ),
      },
      {
        path: 'categories',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/categories/pages/category-list/category-list.component').then(
            (m) => m.CategoryListComponent,
          ),
      },
      {
        path: 'categories/new',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/categories/pages/category-form/category-form.component').then(
            (m) => m.CategoryFormComponent,
          ),
      },
      {
        path: 'categories/:id/edit',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/categories/pages/category-form/category-form.component').then(
            (m) => m.CategoryFormComponent,
          ),
      },
      {
        path: 'favorites',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/favorites/pages/favorite-list/favorite-list.component').then(
            (m) => m.FavoriteListComponent,
          ),
      },
      {
        path: 'settings',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/settings/pages/settings.component').then(
            (m) => m.SettingsComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'products' },
];
