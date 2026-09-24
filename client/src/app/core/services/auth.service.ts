import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, AuthResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'briti_auth_token';
  private readonly USER_KEY = 'briti_auth_user';

  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  private getStoredUser(): User | null {
    try {
      const userJson = localStorage.getItem(this.USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (e) {
      return null;
    }
  }

  public getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  public getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  public isLoggedIn(): boolean {
    return !!this.getToken() && !!this.currentUserSubject.value;
  }

  public isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === 'ADMIN' : false;
  }

  register(data: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, data).pipe(
      tap((res) => {
        if (res.success && res.data.token) {
          this.setSession(res.data.token, res.data.user);
        }
      })
    );
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap((res) => {
        if (res.success && res.data.token) {
          this.setSession(res.data.token, res.data.user);
        }
      })
    );
  }

  getProfile(): Observable<{ success: boolean; data: User }> {
    return this.http.get<{ success: boolean; data: User }>(`${environment.apiUrl}/auth/profile`).pipe(
      tap((res) => {
        if (res.success) {
          this.currentUserSubject.next(res.data);
          localStorage.setItem(this.USER_KEY, JSON.stringify(res.data));
        }
      })
    );
  }

  updateProfile(data: any): Observable<{ success: boolean; data: User }> {
    return this.http.put<{ success: boolean; data: User }>(`${environment.apiUrl}/auth/profile`, data).pipe(
      tap((res) => {
        if (res.success) {
          this.currentUserSubject.next(res.data);
          localStorage.setItem(this.USER_KEY, JSON.stringify(res.data));
        }
      })
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  private setSession(token: string, user: User) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }
}
