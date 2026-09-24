import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../core/services/order.service';
import { PaymentService } from '../../core/services/payment.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { Order } from '../../core/models/order.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="container-fluid px-lg-5 py-4">
      <div class="row justify-content-center">
        <div class="col-12 col-md-9 col-lg-7">
          <!-- Gateway Notice Header -->
          <div class="text-center mb-4">
            <h2 class="fw-bold text-navy mb-1 tracking-tight">DEMO PAYMENT GATEWAY</h2>
            <div class="alert alert-light border py-2 px-3 d-inline-block small text-muted mb-0 shadow-sm">
              <i class="bi bi-info-circle-fill text-primary me-1"></i>
              No real transaction will occur.
            </div>
          </div>

          <app-loading-spinner [show]="isLoading" message="Retrieving order details..."></app-loading-spinner>

          <div *ngIf="!isLoading && order" class="card scientific-card border shadow-sm p-4 p-md-5">
            <!-- Order Summary Header -->
            <div class="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
              <div>
                <span class="badge bg-light text-navy border mb-1">Order # {{ order.orderNumber }}</span>
                <h4 class="fw-bold text-navy mb-0">Select Payment Method</h4>
              </div>
              <div class="text-end">
                <span class="text-muted small d-block">Payable Amount</span>
                <span class="fs-3 fw-bold text-navy">₹{{ order.totalAmount | number:'1.2-2' }}</span>
              </div>
            </div>

            <!-- Payment Method Tabs -->
            <ul class="nav nav-pills nav-fill mb-4 p-1 bg-light rounded border">
              <li class="nav-item">
                <button
                  type="button"
                  class="nav-link py-2 fw-semibold"
                  [class.active]="selectedMethod === 'Card'"
                  (click)="selectMethod('Card')"
                >
                  <i class="bi bi-credit-card-2-front me-1"></i> Card
                </button>
              </li>
              <li class="nav-item">
                <button
                  type="button"
                  class="nav-link py-2 fw-semibold"
                  [class.active]="selectedMethod === 'UPI'"
                  (click)="selectMethod('UPI')"
                >
                  <i class="bi bi-qr-code-scan me-1"></i> UPI
                </button>
              </li>
              <li class="nav-item">
                <button
                  type="button"
                  class="nav-link py-2 fw-semibold"
                  [class.active]="selectedMethod === 'Net Banking'"
                  (click)="selectMethod('Net Banking')"
                >
                  <i class="bi bi-bank me-1"></i> Net Banking
                </button>
              </li>
            </ul>

            <!-- 1. Card Payment Method -->
            <div *ngIf="selectedMethod === 'Card'" class="mb-4">
              <div class="mb-3">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <label class="form-label small fw-bold text-dark mb-0">Card Number *</label>
                  <div class="d-flex gap-2">
                    <button
                      type="button"
                      class="btn btn-link btn-sm p-0 text-success text-decoration-none small"
                      (click)="cardNumber = '4111 1111 1111 1111'"
                    >
                      <i class="bi bi-check2-circle"></i> Use Demo Card
                    </button>
                    <button
                      type="button"
                      class="btn btn-link btn-sm p-0 text-danger text-decoration-none small"
                      (click)="cardNumber = '9999 9999 9999 9999'"
                    >
                      <i class="bi bi-x-circle"></i> Invalid Card
                    </button>
                  </div>
                </div>

                <div class="input-group">
                  <span class="input-group-text bg-white"><i class="bi bi-credit-card"></i></span>
                  <input
                    type="text"
                    class="form-control font-monospace"
                    placeholder="4111 1111 1111 1111"
                    [(ngModel)]="cardNumber"
                    maxlength="19"
                  />
                </div>
                <small class="text-muted mt-1 d-block">
                  Successful demo card: <strong class="text-dark font-monospace">4111 1111 1111 1111</strong>
                </small>
              </div>
            </div>

            <!-- 2. UPI Payment Method -->
            <div *ngIf="selectedMethod === 'UPI'" class="mb-4">
              <div class="mb-3">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <label class="form-label small fw-bold text-dark mb-0">UPI ID *</label>
                  <div class="d-flex gap-2">
                    <button
                      type="button"
                      class="btn btn-link btn-sm p-0 text-success text-decoration-none small"
                      (click)="upiId = 'test@upi'"
                    >
                      <i class="bi bi-check2-circle"></i> Use Demo UPI
                    </button>
                    <button
                      type="button"
                      class="btn btn-link btn-sm p-0 text-danger text-decoration-none small"
                      (click)="upiId = 'wrong@upi'"
                    >
                      <i class="bi bi-x-circle"></i> Invalid UPI
                    </button>
                  </div>
                </div>

                <div class="input-group">
                  <span class="input-group-text bg-white"><i class="bi bi-at"></i></span>
                  <input
                    type="text"
                    class="form-control font-monospace"
                    placeholder="test@upi"
                    [(ngModel)]="upiId"
                  />
                </div>
                <small class="text-muted mt-1 d-block">
                  Successful demo UPI ID: <strong class="text-dark font-monospace">test&#64;upi</strong>
                </small>
              </div>
            </div>

            <!-- 3. Net Banking Payment Method -->
            <div *ngIf="selectedMethod === 'Net Banking'" class="mb-4">
              <div class="mb-3">
                <label class="form-label small fw-bold text-dark mb-1">Select Bank *</label>
                <select class="form-select" [(ngModel)]="bankName">
                  <option value="Demo Bank">Demo Bank</option>
                  <option value="Test Bank">Test Bank</option>
                  <option value="Sample Bank">Sample Bank</option>
                </select>
                <small class="text-muted mt-1 d-block">
                  Selecting any demo bank will allow payment to proceed.
                </small>
              </div>
            </div>

            <!-- Pay Button -->
            <button
              type="button"
              (click)="onPay()"
              class="btn btn-briti-primary w-100 py-3 fw-bold fs-5 shadow"
              [disabled]="isProcessing || !isFormValid()"
            >
              <span *ngIf="isProcessing" class="spinner-border spinner-border-sm me-2"></span>
              {{ isProcessing ? 'Processing Payment...' : 'Pay ₹' + (order.totalAmount | number:'1.2-2') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PaymentComponent implements OnInit {
  order: Order | null = null;
  isLoading: boolean = true;
  isProcessing: boolean = false;
  selectedMethod: 'Card' | 'UPI' | 'Net Banking' = 'Card';

  // Card: ONLY Card Number
  cardNumber: string = '4111 1111 1111 1111';

  // UPI: ONLY UPI ID
  upiId: string = 'test@upi';

  // Net Banking: ONLY Bank dropdown
  bankName: string = 'Demo Bank';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private paymentService: PaymentService,
    private cartService: CartService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const orderId = params['orderId'];
      if (orderId) {
        this.loadOrder(orderId);
      }
    });
  }

  loadOrder(orderId: string) {
    this.isLoading = true;
    this.orderService.getOrderById(orderId).subscribe({
      next: (res) => {
        if (res.success) {
          this.order = res.data;
          if (this.order.paymentStatus === 'Paid') {
            this.toastService.info('This order has already been paid.');
            this.router.navigate(['/order-success', this.order._id]);
          }
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.toastService.error('Order not found or unauthorized.');
        this.router.navigate(['/cart']);
      }
    });
  }

  selectMethod(method: 'Card' | 'UPI' | 'Net Banking') {
    this.selectedMethod = method;
  }

  isFormValid(): boolean {
    if (this.selectedMethod === 'Card') {
      return !!this.cardNumber && this.cardNumber.trim().length > 0;
    }
    if (this.selectedMethod === 'UPI') {
      return !!this.upiId && this.upiId.trim().length > 0;
    }
    if (this.selectedMethod === 'Net Banking') {
      return !!this.bankName && this.bankName.trim().length > 0;
    }
    return false;
  }

  onPay() {
    if (!this.order || this.isProcessing) return;

    // Prevent double-click submission
    this.isProcessing = true;

    const payload: any = {
      orderId: this.order._id,
      paymentMethod: this.selectedMethod
    };

    if (this.selectedMethod === 'Card') {
      payload.cardNumber = this.cardNumber;
    } else if (this.selectedMethod === 'UPI') {
      payload.upiId = this.upiId;
    } else if (this.selectedMethod === 'Net Banking') {
      payload.bankName = this.bankName;
    }

    // Short processing payment simulation state
    setTimeout(() => {
      this.paymentService.processPayment(payload).subscribe({
        next: (res) => {
          this.isProcessing = false;
          if (res.success) {
            this.cartService.resetLocalCart();
            this.toastService.success('Demo payment successful! Order confirmed.');
            this.router.navigate(['/payment-success', this.order!._id], {
              state: { paymentData: res.data }
            });
          }
        },
        error: (err) => {
          this.isProcessing = false;
          this.toastService.error(err.error?.message || 'Demo payment failed.');
          this.router.navigate(['/payment-failed', this.order!._id], {
            state: { errorData: err.error?.data, message: err.error?.message }
          });
        }
      });
    }, 1000);
  }
}
