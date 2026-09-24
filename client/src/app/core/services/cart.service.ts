import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cart } from '../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart`;

  private cartSubject = new BehaviorSubject<Cart | null>(null);
  public cart$ = this.cartSubject.asObservable();

  private cartCountSubject = new BehaviorSubject<number>(0);
  public cartCount$ = this.cartCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  getCart(): Observable<{ success: boolean; data: Cart }> {
    return this.http.get<{ success: boolean; data: Cart }>(this.apiUrl).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.cartSubject.next(res.data);
          this.cartCountSubject.next(res.data.itemCount || 0);
        }
      })
    );
  }

  addToCart(productId: string, packingSize: string, quantity: number = 1): Observable<{ success: boolean; data: Cart; message: string }> {
    return this.http.post<{ success: boolean; data: Cart; message: string }>(this.apiUrl, {
      productId,
      packingSize,
      quantity
    }).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.cartSubject.next(res.data);
          this.cartCountSubject.next(res.data.itemCount || 0);
        }
      })
    );
  }

  updateQuantity(itemId: string, quantity: number): Observable<{ success: boolean; data: Cart; message: string }> {
    return this.http.put<{ success: boolean; data: Cart; message: string }>(`${this.apiUrl}/${itemId}`, {
      quantity
    }).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.cartSubject.next(res.data);
          this.cartCountSubject.next(res.data.itemCount || 0);
        }
      })
    );
  }

  removeItem(itemId: string): Observable<{ success: boolean; data: Cart; message: string }> {
    return this.http.delete<{ success: boolean; data: Cart; message: string }>(`${this.apiUrl}/${itemId}`).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.cartSubject.next(res.data);
          this.cartCountSubject.next(res.data.itemCount || 0);
        }
      })
    );
  }

  clearCart(): Observable<{ success: boolean; data: any; message: string }> {
    return this.http.delete<{ success: boolean; data: any; message: string }>(this.apiUrl).pipe(
      tap((res) => {
        if (res.success) {
          this.cartSubject.next(null);
          this.cartCountSubject.next(0);
        }
      })
    );
  }

  resetLocalCart() {
    this.cartSubject.next(null);
    this.cartCountSubject.next(0);
  }
}
