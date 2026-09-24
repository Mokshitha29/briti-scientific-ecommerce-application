import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Cart } from '../../core/models/cart.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, LoadingSpinnerComponent],
  template: `
    <div class="container-fluid px-lg-5 py-4">
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb scientific-breadcrumb">
          <li class="breadcrumb-item"><a routerLink="/">Home</a></li>
          <li class="breadcrumb-item"><a routerLink="/cart">Cart</a></li>
          <li class="breadcrumb-item active" aria-current="page">Checkout</li>
        </ol>
      </nav>

      <div class="mb-4 pb-2 border-bottom">
        <h2 class="fw-bold text-navy mb-1">Laboratory Shipping & Order Requisition</h2>
        <small class="text-muted">Enter verified institutional delivery coordinates for chemical dispatch</small>
      </div>

      <app-loading-spinner [show]="isLoading" message="Preparing order checkout..."></app-loading-spinner>

      <div *ngIf="!isLoading && cart" class="row g-4">
        <!-- Shipping Form -->
        <div class="col-12 col-lg-7">
          <div class="card scientific-card border shadow-sm p-4 mb-4">
            <h5 class="fw-bold text-navy mb-3 pb-2 border-bottom">
              <i class="bi bi-geo-alt-fill text-primary me-2"></i> Institutional Delivery Address
            </h5>

            <form [formGroup]="shippingForm" (ngSubmit)="onSubmit()">
              <div class="row g-3 mb-3">
                <div class="col-12 col-md-6">
                  <label class="form-label small fw-bold text-dark">Consignee Full Name *</label>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="e.g. Dr. Ramesh Gupta"
                    formControlName="fullName"
                    [class.is-invalid]="f['fullName'].touched && f['fullName'].invalid"
                  />
                  <div *ngIf="f['fullName'].touched && f['fullName'].invalid" class="text-danger small mt-1">
                    Consignee name is required.
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label small fw-bold text-dark">Institutional Email *</label>
                  <input
                    type="email"
                    class="form-control"
                    placeholder="name@laboratory.org"
                    formControlName="email"
                    [class.is-invalid]="f['email'].touched && f['email'].invalid"
                  />
                  <div *ngIf="f['email'].touched && f['email'].invalid" class="text-danger small mt-1">
                    Valid email is required.
                  </div>
                </div>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-12 col-md-6">
                  <label class="form-label small fw-bold text-dark">Contact Phone Number *</label>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="+91 98765 43210"
                    formControlName="phone"
                    [class.is-invalid]="f['phone'].touched && f['phone'].invalid"
                  />
                  <div *ngIf="f['phone'].touched && f['phone'].invalid" class="text-danger small mt-1">
                    Phone number is required.
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label small fw-bold text-dark">Postal PIN Code *</label>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="e.g. 500081"
                    formControlName="pincode"
                    [class.is-invalid]="f['pincode'].touched && f['pincode'].invalid"
                  />
                  <div *ngIf="f['pincode'].touched && f['pincode'].invalid" class="text-danger small mt-1">
                    Pincode is required.
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-bold text-dark">Laboratory / Building Street Address *</label>
                <textarea
                  class="form-control"
                  rows="2"
                  placeholder="Department, Building, Lab Number, Campus Street..."
                  formControlName="address"
                  [class.is-invalid]="f['address'].touched && f['address'].invalid"
                ></textarea>
                <div *ngIf="f['address'].touched && f['address'].invalid" class="text-danger small mt-1">
                  Delivery address is required.
                </div>
              </div>

              <div class="row g-3 mb-4">
                <div class="col-12 col-md-6">
                  <label class="form-label small fw-bold text-dark">City *</label>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="e.g. Hyderabad"
                    formControlName="city"
                    [class.is-invalid]="f['city'].touched && f['city'].invalid"
                  />
                  <div *ngIf="f['city'].touched && f['city'].invalid" class="text-danger small mt-1">
                    City is required.
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label small fw-bold text-dark">State *</label>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="e.g. Telangana"
                    formControlName="state"
                    [class.is-invalid]="f['state'].touched && f['state'].invalid"
                  />
                  <div *ngIf="f['state'].touched && f['state'].invalid" class="text-danger small mt-1">
                    State is required.
                  </div>
                </div>
              </div>

              <div class="p-3 bg-light rounded border mb-4">
                <span class="fw-bold text-dark d-block mb-1">
                  <i class="bi bi-credit-card-2-front text-primary me-1"></i> Simulated Demo Checkout Mode:
                </span>
                <p class="small text-muted mb-0">
                  You will proceed to the <strong>Simulated Demo Payment Gateway</strong> where you can test Card, UPI, or Net Banking transactions safely with test credentials.
                </p>
              </div>

              <button
                type="submit"
                class="btn btn-briti-primary w-100 py-3 fw-bold fs-6 shadow-sm"
                [disabled]="shippingForm.invalid || isSubmitting"
              >
                <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
                <i *ngIf="!isSubmitting" class="bi bi-shield-lock-fill me-2"></i>
                {{ isSubmitting ? 'Verifying Stock & Creating Order...' : 'Proceed to Demo Payment' }}
              </button>
            </form>
          </div>
        </div>

        <!-- Order Items Sidebar -->
        <div class="col-12 col-lg-5">
          <div class="card scientific-card border shadow-sm p-4 sticky-top" style="top: 80px;">
            <h5 class="fw-bold text-navy mb-3 pb-2 border-bottom">Items in Requisition</h5>

            <div class="list-group list-group-flush mb-3" style="max-height: 260px; overflow-y: auto;">
              <div *ngFor="let item of cart.items" class="list-group-item px-0 py-2 border-bottom">
                <div class="d-flex justify-content-between">
                  <div>
                    <span class="fw-semibold text-navy d-block small">{{ item.productName }}</span>
                    <span class="badge bg-light text-dark border small">{{ item.packingSize }}</span>
                    <small class="text-muted ms-2">Qty: {{ item.quantity }}</small>
                  </div>
                  <span class="fw-bold text-dark small">
                    ₹{{ (item.price * item.quantity) | number:'1.2-2' }}
                  </span>
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-between mb-2 small">
              <span class="text-muted">Subtotal</span>
              <span class="fw-semibold text-dark">₹{{ cart.subtotal | number:'1.2-2' }}</span>
            </div>

            <div class="d-flex justify-content-between mb-2 small">
              <span class="text-muted">GST Amount (18%)</span>
              <span class="fw-semibold text-dark">₹{{ cart.gstAmount | number:'1.2-2' }}</span>
            </div>

            <div class="d-flex justify-content-between mb-3 small">
              <span class="text-muted">Hazardous Logistics & Insurance</span>
              <span class="text-success fw-semibold">FREE</span>
            </div>

            <hr class="my-2" />

            <div class="d-flex justify-content-between align-items-center mb-3">
              <span class="fw-bold text-dark">Requisition Total</span>
              <span class="fw-bold text-navy fs-4">₹{{ cart.totalAmount | number:'1.2-2' }}</span>
            </div>

            <small class="text-muted text-center d-block">
              Stock availability will be verified authoritatively by MongoDB before order creation.
            </small>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CheckoutComponent implements OnInit {
  cart: Cart | null = null;
  shippingForm!: FormGroup;
  isLoading: boolean = true;
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}

  get f() {
    return this.shippingForm.controls;
  }

  ngOnInit() {
    this.initForm();
    this.cartService.getCart().subscribe({
      next: (res) => {
        if (res.success) {
          this.cart = res.data;
          if (!this.cart || this.cart.items.length === 0) {
            this.toastService.info('Your cart is empty.');
            this.router.navigate(['/cart']);
            return;
          }
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/cart']);
      }
    });
  }

  initForm() {
    const user = this.authService.getCurrentUser();
    this.shippingForm = this.fb.group({
      fullName: [user?.fullName || '', Validators.required],
      email: [user?.email || '', [Validators.required, Validators.email]],
      phone: [user?.phone || '', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      pincode: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.shippingForm.invalid) return;

    this.isSubmitting = true;

    this.orderService.createOrder(this.shippingForm.value, 'Demo Payment Gateway').subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.success && res.data) {
          this.toastService.success('Pending order registered. Redirecting to demo payment...');
          this.router.navigate(['/payment', res.data._id]);
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toastService.error(err.error?.message || 'Failed to create order. Please check item stock.');
      }
    });
  }
}
