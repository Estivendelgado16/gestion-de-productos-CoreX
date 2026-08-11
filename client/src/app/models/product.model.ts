import { Category } from './category.model';

export interface ProductImage {
  id: string;
  url: string;
  order: number;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  categoryId: string;
  category: Category;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductQueryParams {
  search?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}

export interface ProductListResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId: string;
  images?: string[];
}

export type UpdateProductPayload = Partial<CreateProductPayload>;
