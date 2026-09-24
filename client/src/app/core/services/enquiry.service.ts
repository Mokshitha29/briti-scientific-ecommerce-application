import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Enquiry } from '../models/enquiry.model';

@Injectable({
  providedIn: 'root'
})
export class EnquiryService {
  private apiUrl = `${environment.apiUrl}/enquiries`;

  constructor(private http: HttpClient) {}

  submitEnquiry(data: Enquiry): Observable<{ success: boolean; message: string; data: Enquiry }> {
    return this.http.post<{ success: boolean; message: string; data: Enquiry }>(this.apiUrl, data);
  }

  getMyEnquiries(): Observable<{ success: boolean; data: Enquiry[] }> {
    return this.http.get<{ success: boolean; data: Enquiry[] }>(`${this.apiUrl}/my-enquiries`);
  }
}
