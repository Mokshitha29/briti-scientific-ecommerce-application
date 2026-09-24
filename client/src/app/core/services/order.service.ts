import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, ShippingAddress } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  createOrder(shippingAddress: ShippingAddress, paymentMethod: string = 'Demo Payment Gateway'): Observable<{ success: boolean; message: string; data: Order }> {
    return this.http.post<{ success: boolean; message: string; data: Order }>(this.apiUrl, {
      shippingAddress,
      paymentMethod
    });
  }

  getMyOrders(): Observable<{ success: boolean; message: string; data: Order[] }> {
    return this.http.get<{ success: boolean; message: string; data: Order[] }>(`${this.apiUrl}/my-orders`);
  }

  getOrderById(id: string): Observable<{ success: boolean; message: string; data: Order }> {
    return this.http.get<{ success: boolean; message: string; data: Order }>(`${this.apiUrl}/${id}`);
  }
}
