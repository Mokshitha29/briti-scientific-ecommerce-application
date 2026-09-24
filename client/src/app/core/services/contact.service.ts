import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ContactMessage, ContactSubmissionPayload } from '../models/contact.model';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = `${environment.apiUrl}/contact`;

  constructor(private http: HttpClient) {}

  /**
   * Submit contact form message (public / customer)
   */
  submitContact(data: ContactSubmissionPayload): Observable<{ success: boolean; message: string; data: ContactMessage }> {
    return this.http.post<{ success: boolean; message: string; data: ContactMessage }>(this.apiUrl, data);
  }

  /**
   * Get all contact messages with optional filters (admin only)
   */
  getContactMessages(filters: any = {}): Observable<{ success: boolean; message: string; data: ContactMessage[]; pagination: any }> {
    let params = new HttpParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    });
    return this.http.get<{ success: boolean; message: string; data: ContactMessage[]; pagination: any }>(this.apiUrl, { params });
  }

  /**
   * Get contact message by ID (admin only)
   */
  getContactMessageById(id: string): Observable<{ success: boolean; message: string; data: ContactMessage }> {
    return this.http.get<{ success: boolean; message: string; data: ContactMessage }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Update status of contact message (admin only)
   */
  updateContactStatus(id: string, status: string): Observable<{ success: boolean; message: string; data: ContactMessage }> {
    return this.http.put<{ success: boolean; message: string; data: ContactMessage }>(`${this.apiUrl}/${id}/status`, { status });
  }
}
