import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../../core/services/contact.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid px-lg-5 py-4">
      <div class="mb-4 pb-2 border-bottom">
        <h2 class="fw-bold text-navy mb-1">Contact Technical & Sales Support</h2>
        <small class="text-muted">Reach out to our chemical application specialists and order desk</small>
      </div>

      <div class="row g-4">
        <!-- Contact Form -->
        <div class="col-12 col-lg-7">
          <div class="card scientific-card border shadow-sm p-4 p-md-5">
            <h5 class="fw-bold text-navy mb-3 pb-2 border-bottom">
              <i class="bi bi-envelope-at text-primary me-2"></i> Send Us a Message
            </h5>

            <form (ngSubmit)="onSubmit()">
              <div class="row g-3 mb-3">
                <div class="col-12 col-md-6">
                  <label class="form-label small fw-bold text-dark">Your Name *</label>
                  <input
                    type="text"
                    class="form-control"
                    [(ngModel)]="name"
                    name="name"
                    placeholder="e.g. Dr. Ramesh Gupta"
                    required
                  />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label small fw-bold text-dark">Email Address *</label>
                  <input
                    type="email"
                    class="form-control"
                    [(ngModel)]="email"
                    name="email"
                    placeholder="e.g. ramesh@institution.org"
                    required
                  />
                </div>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-12 col-md-6">
                  <label class="form-label small fw-bold text-dark">Phone Number</label>
                  <input
                    type="text"
                    class="form-control"
                    [(ngModel)]="phone"
                    name="phone"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label small fw-bold text-dark">Subject *</label>
                  <input
                    type="text"
                    class="form-control"
                    [(ngModel)]="subject"
                    name="subject"
                    placeholder="e.g. HPLC Grade Solvents Query"
                    required
                  />
                </div>
              </div>

              <div class="mb-4">
                <label class="form-label small fw-bold text-dark">Message / Technical Requirement *</label>
                <textarea
                  class="form-control"
                  rows="4"
                  [(ngModel)]="message"
                  name="message"
                  placeholder="Detail your chemical specifications, standard grades, or delivery requirements..."
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                class="btn btn-briti-primary px-4 py-2 fw-semibold"
                [disabled]="isSubmitting || !name || !email || !subject || !message"
              >
                <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
                <i *ngIf="!isSubmitting" class="bi bi-send me-1"></i>
                {{ isSubmitting ? 'Sending Message...' : 'Send Message' }}
              </button>
            </form>
          </div>
        </div>

        <!-- Corporate Contact Info -->
        <div class="col-12 col-lg-5">
          <div class="card scientific-card border shadow-sm p-4 h-100">
            <h5 class="fw-bold text-navy mb-3 pb-2 border-bottom">
              <i class="bi bi-building text-primary me-2"></i> Laboratory Headquarters
            </h5>

            <div class="d-flex flex-column gap-3 mt-2">
              <div class="d-flex gap-3">
                <div class="bg-light rounded p-2 text-primary">
                  <i class="bi bi-geo-alt-fill fs-4"></i>
                </div>
                <div>
                  <strong class="text-dark d-block">Facility Address</strong>
                  <span class="text-muted small">Plot 45, Biotech Park Phase II, Genome Valley, Hyderabad, Telangana, 500078</span>
                </div>
              </div>

              <div class="d-flex gap-3">
                <div class="bg-light rounded p-2 text-primary">
                  <i class="bi bi-telephone-fill fs-4"></i>
                </div>
                <div>
                  <strong class="text-dark d-block">Customer Desk</strong>
                  <span class="text-muted small">+91 40 2345 6789 / +91 40 2345 6790</span>
                </div>
              </div>

              <div class="d-flex gap-3">
                <div class="bg-light rounded p-2 text-primary">
                  <i class="bi bi-envelope-fill fs-4"></i>
                </div>
                <div>
                  <strong class="text-dark d-block">Official Email</strong>
                  <span class="text-muted small">sales&#64;britiscientific.com / support&#64;britiscientific.com</span>
                </div>
              </div>

              <div class="d-flex gap-3">
                <div class="bg-light rounded p-2 text-primary">
                  <i class="bi bi-clock-fill fs-4"></i>
                </div>
                <div>
                  <strong class="text-dark d-block">Working Hours</strong>
                  <span class="text-muted small">Monday – Saturday: 9:00 AM – 6:00 PM IST</span>
                </div>
              </div>
            </div>

            <div class="mt-4 p-3 bg-light rounded border text-muted small">
              <i class="bi bi-shield-check text-success me-1"></i>
              <strong>Technical Sourcing:</strong> For urgent hazardous material transport permits or Certificate of Analysis requests, please attach reference batch numbers.
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ContactComponent implements OnInit {
  name: string = '';
  email: string = '';
  phone: string = '';
  subject: string = '';
  message: string = '';
  isSubmitting: boolean = false;

  constructor(
    private contactService: ContactService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      if (!this.name) this.name = user.fullName || '';
      if (!this.email) this.email = user.email || '';
      if (!this.phone && user.phone) this.phone = user.phone;
    }
  }

  onSubmit() {
    if (!this.name || !this.email || !this.subject || !this.message || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    this.contactService.submitContact({
      name: this.name,
      email: this.email,
      phone: this.phone,
      subject: this.subject,
      message: this.message
    }).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.toastService.success(res.message || 'Thank you! Your message has been sent to our sales engineering team.');
        this.name = '';
        this.email = '';
        this.phone = '';
        this.subject = '';
        this.message = '';
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toastService.error(err.error?.message || 'Failed to submit contact message. Please try again.');
      }
    });
  }
}
