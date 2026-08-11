import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../core/config/api.config';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private readonly baseUrl: string = `${API_BASE_URL}/favorites`;

  constructor(private readonly http: HttpClient) {}

  getFavorites(): Observable<Product[]> {
    return this.http.get<Product[]>(this.baseUrl);
  }

  addFavorite(productId: string): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/${productId}`, {});
  }

  removeFavorite(productId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${productId}`);
  }
}
