import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Payment, PaymentProcessPayload } from '../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  processPayment(payload: PaymentProcessPayload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/process`, payload);
  }

  getPaymentByOrderId(orderId: string): Observable<{ success: boolean; data: Payment[] }> {
    return this.http.get<{ success: boolean; data: Payment[] }>(`${this.apiUrl}/${orderId}`);
  }
}
