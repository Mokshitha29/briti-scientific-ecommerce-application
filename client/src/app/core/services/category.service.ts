import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  getCategories(all: boolean = false): Observable<{ success: boolean; data: Category[] }> {
    return this.http.get<{ success: boolean; data: Category[] }>(`${this.apiUrl}?all=${all}`);
  }

  getCategoryById(id: string): Observable<{ success: boolean; data: Category }> {
    return this.http.get<{ success: boolean; data: Category }>(`${this.apiUrl}/${id}`);
  }

  createCategory(data: Partial<Category>): Observable<{ success: boolean; data: Category }> {
    return this.http.post<{ success: boolean; data: Category }>(this.apiUrl, data);
  }

  updateCategory(id: string, data: Partial<Category>): Observable<{ success: boolean; data: Category }> {
    return this.http.put<{ success: boolean; data: Category }>(`${this.apiUrl}/${id}`, data);
  }

  deleteCategory(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}
