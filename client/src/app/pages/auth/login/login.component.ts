import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="container py-5 my-3">
      <div class="row justify-content-center">
        <div class="col-12 col-md-8 col-lg-5">
          <div class="card scientific-card border shadow-sm p-4 p-md-5">
            <!-- Header -->
            <div class="text-center mb-4">
              <div class="bg-navy text-white rounded d-inline-flex p-3 mb-2">
                <i class="bi bi-shield-lock-fill fs-3 text-warning"></i>
              </div>
              <h3 class="fw-bold text-navy mb-1">Account Login</h3>
              <p class="text-muted small">Access your Briti Scientific chemical ordering portal</p>
            </div>

            <!-- Error Banner -->
            <div *ngIf="errorMessage" class="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3">
              <i class="bi bi-exclamation-triangle-fill"></i>
              <span>{{ errorMessage }}</span>
            </div>

            <!-- Login Form -->
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              <div class="mb-3">
                <label class="form-label small fw-bold text-dark">Email Address *</label>
                <div class="input-group">
                  <span class="input-group-text bg-light text-muted"><i class="bi bi-envelope"></i></span>
                  <input
                    type="email"
                    class="form-control"
                    placeholder="name@company.com"
                    formControlName="email"
                    [class.is-invalid]="loginForm.get('email')?.touched && loginForm.get('email')?.invalid"
                  />
                </div>
                <div *ngIf="loginForm.get('email')?.touched && loginForm.get('email')?.invalid" class="text-danger small mt-1">
                  Please enter a valid email address.
                </div>
              </div>

              <div class="mb-4">
                <label class="form-label small fw-bold text-dark">Password *</label>
                <div class="input-group">
                  <span class="input-group-text bg-light text-muted"><i class="bi bi-key"></i></span>
                  <input
                    [type]="showPassword ? 'text' : 'password'"
                    class="form-control"
                    placeholder="Enter password"
                    formControlName="password"
                    [class.is-invalid]="loginForm.get('password')?.touched && loginForm.get('password')?.invalid"
                  />
                  <button type="button" class="btn btn-outline-secondary" (click)="showPassword = !showPassword">
                    <i class="bi" [ngClass]="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                  </button>
                </div>
                <div *ngIf="loginForm.get('password')?.touched && loginForm.get('password')?.invalid" class="text-danger small mt-1">
                  Password is required.
                </div>
              </div>

              <button
                type="submit"
                class="btn btn-briti-primary w-100 py-2 fw-semibold"
                [disabled]="loginForm.invalid || isSubmitting"
              >
                <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
                {{ isSubmitting ? 'Authenticating...' : 'Sign In' }}
              </button>
            </form>

            <!-- Quick Demo Credentials Box -->
            <div class="mt-4 p-3 bg-light rounded border small">
              <span class="fw-bold text-dark d-block mb-1">
                <i class="bi bi-info-circle text-primary me-1"></i> Demo Credentials:
              </span>
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span><strong>Admin:</strong> admin&#64;britiscientific.com</span>
                <button type="button" class="btn btn-xs btn-outline-secondary py-0 px-2" (click)="fillDemo('admin@britiscientific.com', 'Ad@123')">
                  Autofill
                </button>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <span><strong>User:</strong> rahul.sharma&#64;researchlab.org</span>
                <button type="button" class="btn btn-xs btn-outline-secondary py-0 px-2" (click)="fillDemo('rahul.sharma@researchlab.org', 'Pass@1')">
                  Autofill
                </button>
              </div>
            </div>

            <!-- Footer Link -->
            <div class="text-center mt-4">
              <span class="text-muted small">Don't have an account? </span>
              <a routerLink="/register" class="fw-semibold text-primary small">Register for B2B Access</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isSubmitting: boolean = false;
  showPassword: boolean = false;
  errorMessage: string = '';
  returnUrl: string = '/';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    if (this.authService.isLoggedIn()) {
      this.router.navigate([this.returnUrl]);
    }

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  fillDemo(email: string, pass: string) {
    this.loginForm.patchValue({ email, password: pass });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.toastService.success(`Welcome back, ${res.data.user.fullName}!`);
        if (res.data.user.role === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate([this.returnUrl]);
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Invalid email or password.';
        this.toastService.error(this.errorMessage);
      }
    });
  }
}
