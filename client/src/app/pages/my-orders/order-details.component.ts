import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../core/models/order.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent],
  template: `
    <div class="container-fluid px-lg-5 py-4">
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb scientific-breadcrumb">
          <li class="breadcrumb-item"><a routerLink="/">Home</a></li>
          <li class="breadcrumb-item"><a routerLink="/my-orders">My Orders</a></li>
          <li class="breadcrumb-item active" aria-current="page">{{ order?.orderNumber || 'Invoice' }}</li>
        </ol>
      </nav>

      <app-loading-spinner [show]="isLoading" message="Loading requisition invoice..."></app-loading-spinner>

      <div *ngIf="!isLoading && order" class="card scientific-card border shadow-sm p-4 p-md-5">
        <!-- Invoice Header -->
        <div class="d-flex flex-wrap justify-content-between align-items-start border-bottom pb-4 mb-4">
          <div>
            <div class="d-flex align-items-center gap-2 mb-2">
              <span class="fs-4 fw-bold text-navy">BRITI SCIENTIFIC</span>
              <span class="badge bg-secondary">COMMERCIAL INVOICE</span>
            </div>
            <p class="text-muted small mb-0">Order Requisition Ref: <strong class="text-dark">{{ order.orderNumber }}</strong></p>
            <p class="text-muted small mb-0">Date Placed: {{ order.createdAt | date:'medium' }}</p>
            <p *ngIf="order.transactionId" class="text-muted small mb-0">
              Transaction ID: <span class="font-monospace text-primary fw-semibold">{{ order.transactionId }}</span>
            </p>
          </div>
          <div class="text-md-end mt-3 mt-md-0">
            <div class="mb-2">
              <span class="badge me-1" [ngClass]="order.paymentStatus === 'Paid' ? 'bg-success fs-6' : 'bg-warning text-dark fs-6'">
                Payment: {{ order.paymentStatus }}
              </span>
              <span class="badge bg-primary fs-6">
                Status: {{ order.orderStatus }}
              </span>
            </div>
            <small class="text-muted d-block">Payment Mode: {{ order.paymentMethod }}</small>
          </div>
        </div>

        <!-- Pending Order Payment Reminder -->
        <div *ngIf="order.paymentStatus !== 'Paid'" class="alert alert-warning d-flex justify-content-between align-items-center mb-4">
          <div>
            <i class="bi bi-clock-history me-2"></i>
            <strong>Payment Pending:</strong> This order has not been completed. Proceed to demo payment to confirm allocation.
          </div>
          <a [routerLink]="['/payment', order._id]" class="btn btn-sm btn-primary">
            Pay Now <i class="bi bi-arrow-right ms-1"></i>
          </a>
        </div>

        <!-- Consignee / Shipping Address Details -->
        <div class="row g-4 mb-4">
          <div class="col-12 col-md-6">
            <h6 class="fw-bold text-navy text-uppercase small border-bottom pb-2">Delivery Coordinates</h6>
            <div class="small text-secondary lh-base mt-2">
              <strong class="text-dark">{{ order.shippingAddress.fullName }}</strong><br />
              {{ order.shippingAddress.address }}<br />
              {{ order.shippingAddress.city }}, {{ order.shippingAddress.state }} - {{ order.shippingAddress.pincode }}<br />
              Phone: {{ order.shippingAddress.phone }}<br />
              Email: {{ order.shippingAddress.email }}
            </div>
          </div>
          <div class="col-12 col-md-6">
            <h6 class="fw-bold text-navy text-uppercase small border-bottom pb-2">Technical Dispatch Details</h6>
            <div class="small text-secondary lh-base mt-2">
              <strong>Fulfillment Mode:</strong> Temperature Controlled Chemical Carrier<br />
              <strong>Packaging Standard:</strong> UN Certified Amber Glass / Polythene Outer<br />
              <strong>CoA Inclusion:</strong> Included with batch QR code<br />
              <strong>GST Assessment:</strong> Integrated CGST + SGST (18%)
            </div>
          </div>
        </div>

        <!-- Line Items Table -->
        <div class="table-responsive-custom mb-4">
          <table class="scientific-table">
            <thead>
              <tr>
                <th>Item #</th>
                <th>Chemical Description</th>
                <th>Packing Size</th>
                <th>Unit Price</th>
                <th>Qty</th>
                <th class="text-end">Line Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of order.items; let i = index">
                <td>{{ i + 1 }}</td>
                <td class="fw-bold text-navy">{{ item.productName }}</td>
                <td><span class="badge bg-light text-dark border">{{ item.packingSize }}</span></td>
                <td>₹{{ item.price | number:'1.2-2' }}</td>
                <td>{{ item.quantity }}</td>
                <td class="text-end fw-semibold text-dark">₹{{ (item.price * item.quantity) | number:'1.2-2' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Financial Summary -->
        <div class="row justify-content-end mb-4">
          <div class="col-12 col-md-5">
            <div class="bg-light rounded p-3 border">
              <div class="d-flex justify-content-between mb-2 small">
                <span class="text-muted">Requisition Subtotal:</span>
                <span class="fw-semibold text-dark">₹{{ order.subtotal | number:'1.2-2' }}</span>
              </div>
              <div class="d-flex justify-content-between mb-2 small">
                <span class="text-muted">Applicable GST:</span>
                <span class="fw-semibold text-dark">₹{{ order.gstAmount | number:'1.2-2' }}</span>
              </div>
              <div class="d-flex justify-content-between mb-2 small">
                <span class="text-muted">Hazardous Logistics & Freight:</span>
                <span class="text-success fw-semibold">FREE</span>
              </div>
              <hr class="my-2" />
              <div class="d-flex justify-content-between align-items-center">
                <span class="fw-bold text-dark fs-6">Grand Total:</span>
                <span class="fw-bold text-navy fs-5">₹{{ order.totalAmount | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="d-flex justify-content-between align-items-center pt-3 border-top">
          <a routerLink="/my-orders" class="btn btn-outline-secondary btn-sm">
            <i class="bi bi-arrow-left me-1"></i> Back to Orders
          </a>
          <button type="button" class="btn btn-outline-primary btn-sm" (click)="printInvoice()">
            <i class="bi bi-printer me-1"></i> Print Invoice
          </button>
        </div>
      </div>
    </div>
  `
})
export class OrderDetailsComponent implements OnInit {
  order: Order | null = null;
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.orderService.getOrderById(id).subscribe({
          next: (res) => {
            if (res.success) this.order = res.data;
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
            this.router.navigate(['/my-orders']);
          }
        });
      }
    });
  }

  printInvoice() {
    window.print();
  }
}
