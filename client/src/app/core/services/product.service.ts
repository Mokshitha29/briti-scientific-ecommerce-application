import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, ProductListResponse } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getProducts(filters: any = {}): Observable<ProductListResponse> {
    let params = new HttpParams();

    Object.keys(filters).forEach((key) => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    });

    return this.http.get<ProductListResponse>(this.apiUrl, { params });
  }

  getProductById(id: string): Observable<{ success: boolean; data: Product }> {
    return this.http.get<{ success: boolean; data: Product }>(`${this.apiUrl}/${id}`);
  }

  createProduct(data: any): Observable<{ success: boolean; data: Product }> {
    return this.http.post<{ success: boolean; data: Product }>(this.apiUrl, data);
  }

  updateProduct(id: string, data: any): Observable<{ success: boolean; data: Product }> {
    return this.http.put<{ success: boolean; data: Product }>(`${this.apiUrl}/${id}`, data);
  }

  deleteProduct(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}
