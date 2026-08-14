import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../core/config/api.config';
import {
  CreateProductPayload,
  Product,
  ProductListResponse,
  ProductQueryParams,
  UpdateProductPayload,
} from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly baseUrl: string = `${API_BASE_URL}/products`;

  constructor(private readonly http: HttpClient) {}

  getProducts(params: ProductQueryParams = {}): Observable<ProductListResponse> {
    let httpParams: HttpParams = new HttpParams();

    if (params.search !== undefined && params.search !== '') {
      httpParams = httpParams.set('search', params.search);
    }
    if (params.categoryId !== undefined && params.categoryId !== '') {
      httpParams = httpParams.set('categoryId', params.categoryId);
    }
    if (params.categoryName !== undefined && params.categoryName !== '') {
      httpParams = httpParams.set('categoryName', params.categoryName);
    }
    if (params.page !== undefined) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.limit !== undefined) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }

    return this.http.get<ProductListResponse>(this.baseUrl, { params: httpParams });
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`);
  }

  createProduct(payload: CreateProductPayload): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, payload);
  }

  updateProduct(id: string, payload: UpdateProductPayload): Observable<Product> {
    return this.http.patch<Product>(`${this.baseUrl}/${id}`, payload);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
