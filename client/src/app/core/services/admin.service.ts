import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard`);
  }

  getUsers(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users`);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/users/${id}`);
  }

  getOrders(filters: any = {}): Observable<any> {
    let params = new HttpParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    });
    return this.http.get<any>(`${this.apiUrl}/orders`, { params });
  }

  updateOrderStatus(id: string, orderStatus?: string, paymentStatus?: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/orders/${id}/status`, {
      orderStatus,
      paymentStatus
    });
  }

  getEnquiries(filters: any = {}): Observable<any> {
    let params = new HttpParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    });
    return this.http.get<any>(`${this.apiUrl}/enquiries`, { params });
  }

  updateEnquiryStatus(id: string, status: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/enquiries/${id}/status`, { status });
  }
}
