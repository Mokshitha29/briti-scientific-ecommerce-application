import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

export function passwordPatternValidator(): (control: AbstractControl) => ValidationErrors | null {
  const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*!])(?=\S+$)[A-Za-z\d@#$%^&*!]{6,}$/;
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const valid = pattern.test(control.value);
    return valid ? null : { invalidPasswordPattern: true };
  };
}

export function confirmPasswordValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  if (password && confirmPassword && password !== confirmPassword) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="container py-5 my-3">
      <div class="row justify-content-center">
        <div class="col-12 col-md-10 col-lg-7">
          <div class="card scientific-card border shadow-sm p-4 p-md-5">
            <!-- Header -->
            <div class="text-center mb-4">
              <div class="bg-navy text-white rounded d-inline-flex p-3 mb-2">
                <i class="bi bi-person-plus-fill fs-3 text-warning"></i>
              </div>
              <h3 class="fw-bold text-navy mb-1">Create Customer Account</h3>
              <p class="text-muted small">Register for institutional and laboratory scientific chemical purchasing</p>
            </div>

            <!-- Error Banner -->
            <div *ngIf="errorMessage" class="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3">
              <i class="bi bi-exclamation-triangle-fill"></i>
              <span>{{ errorMessage }}</span>
            </div>

            <!-- Registration Form -->
            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
              <div class="row g-3 mb-3">
                <div class="col-12 col-md-6">
                  <label class="form-label small fw-bold text-dark">Full Name *</label>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="e.g. Dr. Rajesh Kumar"
                    formControlName="fullName"
                    [class.is-invalid]="f['fullName'].touched && f['fullName'].invalid"
                  />
                  <div *ngIf="f['fullName'].touched && f['fullName'].invalid" class="text-danger small mt-1">
                    Full name is required (min 2 characters).
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label small fw-bold text-dark">Official Email *</label>
                  <input
                    type="email"
                    class="form-control"
                    placeholder="name@company.org"
                    formControlName="email"
                    [class.is-invalid]="f['email'].touched && f['email'].invalid"
                  />
                  <div *ngIf="f['email'].touched && f['email'].invalid" class="text-danger small mt-1">
                    Please provide a valid institutional email.
                  </div>
                </div>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-12 col-md-6">
                  <label class="form-label small fw-bold text-dark">Phone Number</label>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="+91 98765 43210"
                    formControlName="phone"
                  />
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label small fw-bold text-dark">Company / Institute Name</label>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="e.g. Apex Biotech Labs"
                    formControlName="companyName"
                  />
                </div>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-12 col-md-6">
                  <label class="form-label small fw-bold text-dark">Password *</label>
                  <div class="input-group">
                    <input
                      [type]="showPassword ? 'text' : 'password'"
                      class="form-control"
                      placeholder="e.g. Chem@123"
                      formControlName="password"
                      [class.is-invalid]="f['password'].touched && f['password'].invalid"
                    />
                    <button type="button" class="btn btn-outline-secondary" (click)="showPassword = !showPassword">
                      <i class="bi" [ngClass]="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                    </button>
                  </div>
                  <div *ngIf="f['password'].touched && f['password'].errors?.['invalidPasswordPattern']" class="text-danger small mt-1">
                    Password must be at least 6 characters and contain uppercase, lowercase, number and special character.
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label small fw-bold text-dark">Confirm Password *</label>
                  <input
                    [type]="showPassword ? 'text' : 'password'"
                    class="form-control"
                    placeholder="Re-enter password"
                    formControlName="confirmPassword"
                    [class.is-invalid]="(f['confirmPassword'].touched || registerForm.hasError('passwordMismatch')) && (f['confirmPassword'].invalid || registerForm.hasError('passwordMismatch'))"
                  />
                  <div *ngIf="registerForm.hasError('passwordMismatch') && f['confirmPassword'].touched" class="text-danger small mt-1">
                    Passwords do not match.
                  </div>
                </div>
              </div>

              <!-- Password Guidelines Alert -->
              <div class="p-3 bg-light rounded border mb-4 small text-muted">
                <span class="fw-bold text-dark d-block mb-1">
                  <i class="bi bi-shield-check text-success me-1"></i> Strict Password Requirements:
                </span>
                <ul class="mb-0 ps-3">
                  <li>At least 6 characters long (no spaces)</li>
                  <li>At least one uppercase letter (A-Z) and one lowercase letter (a-z)</li>
                  <li>At least one number (0-9)</li>
                  <li>At least one special character (e.g. &#64;, #, $, %, !, ^, &amp;, *)</li>
                </ul>
              </div>

              <button
                type="submit"
                class="btn btn-briti-primary w-100 py-2 fw-semibold"
                [disabled]="registerForm.invalid || isSubmitting"
              >
                <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
                {{ isSubmitting ? 'Registering Account...' : 'Complete Registration' }}
              </button>
            </form>

            <div class="text-center mt-4">
              <span class="text-muted small">Already have an institutional account? </span>
              <a routerLink="/login" class="fw-semibold text-primary small">Sign In</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isSubmitting: boolean = false;
  showPassword: boolean = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}

  get f() {
    return this.registerForm.controls;
  }

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }

    this.registerForm = this.fb.group(
      {
        fullName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        phone: [''],
        companyName: [''],
        password: ['', [Validators.required, passwordPatternValidator()]],
        confirmPassword: ['', [Validators.required]]
      },
      { validators: confirmPasswordValidator }
    );
  }

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    const payload = {
      fullName: this.registerForm.value.fullName,
      email: this.registerForm.value.email,
      phone: this.registerForm.value.phone,
      companyName: this.registerForm.value.companyName,
      password: this.registerForm.value.password,
      confirmPassword: this.registerForm.value.confirmPassword
    };

    this.authService.register(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.toastService.success('Registration successful! Welcome to Briti Scientific.');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isSubmitting = false;
        if (err.status === 409) {
          this.errorMessage = 'An account with this email already exists.';
        } else {
          this.errorMessage = err.error?.message || 'Registration failed. Please check your details.';
        }
        this.toastService.error(this.errorMessage);
      }
    });
  }
}
