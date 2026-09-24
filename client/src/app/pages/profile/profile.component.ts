import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { User } from '../../core/models/user.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
  template: `
    <div class="container py-5 my-3">
      <div class="row justify-content-center">
        <div class="col-12 col-md-10 col-lg-7">
          <app-loading-spinner [show]="isLoading" message="Loading profile credentials..."></app-loading-spinner>

          <div *ngIf="!isLoading && user" class="card scientific-card border shadow-sm p-4 p-md-5">
            <div class="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
              <div class="bg-navy text-white rounded-circle p-3 d-flex align-items-center justify-content-center shadow-sm" style="width: 64px; height: 64px;">
                <i class="bi bi-person-fill fs-2 text-warning"></i>
              </div>
              <div>
                <h3 class="fw-bold text-navy mb-0">{{ user.fullName }}</h3>
                <span class="badge" [ngClass]="user.role === 'ADMIN' ? 'bg-danger' : 'bg-primary'">
                  {{ user.role }} Account
                </span>
                <small class="text-muted ms-2">Member since {{ user.createdAt | date:'mediumDate' }}</small>
              </div>
            </div>

            <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
              <div class="mb-3">
                <label class="form-label small fw-bold text-dark">Official Email (Permanent)</label>
                <input
                  type="email"
                  class="form-control bg-light font-monospace"
                  [value]="user.email"
                  readonly
                  disabled
                />
                <small class="text-muted">Email address is linked to your institutional registration and cannot be modified.</small>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-bold text-dark">Full Name *</label>
                <input
                  type="text"
                  class="form-control"
                  formControlName="fullName"
                  [class.is-invalid]="f['fullName'].touched && f['fullName'].invalid"
                />
                <div *ngIf="f['fullName'].touched && f['fullName'].invalid" class="text-danger small mt-1">
                  Full name is required.
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-bold text-dark">Contact Phone</label>
                <input
                  type="text"
                  class="form-control"
                  formControlName="phone"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div class="mb-4">
                <label class="form-label small fw-bold text-dark">Company / Institute Name</label>
                <input
                  type="text"
                  class="form-control"
                  formControlName="companyName"
                  placeholder="e.g. Apex Biotech Institute"
                />
              </div>

              <div class="p-3 bg-light rounded border mb-4 small text-muted">
                <i class="bi bi-shield-check text-success me-1"></i>
                <strong>Role Authorization:</strong> Your assigned access level is <strong>{{ user.role }}</strong>. Contact administration for permission changes.
              </div>

              <button
                type="submit"
                class="btn btn-briti-primary px-4 py-2 fw-semibold"
                [disabled]="profileForm.invalid || isSubmitting"
              >
                <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
                {{ isSubmitting ? 'Saving Changes...' : 'Update Profile' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  profileForm!: FormGroup;
  isLoading: boolean = true;
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  get f() {
    return this.profileForm.controls;
  }

  ngOnInit() {
    this.authService.getProfile().subscribe({
      next: (res) => {
        if (res.success) {
          this.user = res.data;
          this.profileForm = this.fb.group({
            fullName: [this.user.fullName, [Validators.required, Validators.minLength(2)]],
            phone: [this.user.phone || ''],
            companyName: [this.user.companyName || '']
          });
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onSubmit() {
    if (this.profileForm.invalid) return;

    this.isSubmitting = true;
    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.success) {
          this.user = res.data;
          this.toastService.success('Profile credentials updated successfully.');
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toastService.error(err.error?.message || 'Failed to update profile.');
      }
    });
  }
}
