import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../core/models/order.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent],
  template: `
    <div class="container py-5 my-4">
      <div class="row justify-content-center">
        <div class="col-12 col-md-8 col-lg-6 text-center">
          <app-loading-spinner [show]="isLoading" message="Loading order details..."></app-loading-spinner>

          <div *ngIf="!isLoading && order" class="card scientific-card border shadow-sm p-4 p-md-5">
            <div class="bg-primary text-white rounded-circle mx-auto p-3 mb-3 d-flex align-items-center justify-content-center shadow" style="width: 80px; height: 80px;">
              <i class="bi bi-box-seam fs-1"></i>
            </div>

            <h3 class="fw-bold text-navy mb-2">Order Confirmed</h3>
            <p class="text-muted small mb-4">
              Thank you for ordering with Briti Scientific. Your chemical requisition has been processed.
            </p>

            <div class="bg-light rounded border p-3 text-start small mb-4">
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted">Order Number:</span>
                <span class="fw-bold text-navy">{{ order.orderNumber }}</span>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted">Payment Status:</span>
                <span class="badge" [ngClass]="order.paymentStatus === 'Paid' ? 'bg-success' : 'bg-warning text-dark'">
                  {{ order.paymentStatus }}
                </span>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted">Order Status:</span>
                <span class="badge bg-primary">{{ order.orderStatus }}</span>
              </div>
              <div class="d-flex justify-content-between">
                <span class="text-muted">Total Amount:</span>
                <span class="fw-bold text-dark fs-6">₹{{ order.totalAmount | number:'1.2-2' }}</span>
              </div>
            </div>

            <div class="d-flex flex-column flex-sm-row gap-2 justify-content-center">
              <a [routerLink]="['/my-orders', order._id]" class="btn btn-briti-primary fw-semibold px-4">
                <i class="bi bi-receipt me-1"></i> View Order Details
              </a>
              <a routerLink="/products" class="btn btn-outline-secondary fw-semibold px-4">
                Continue Shopping
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class OrderSuccessComponent implements OnInit {
  order: Order | null = null;
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const orderId = params['orderId'];
      if (orderId) {
        this.orderService.getOrderById(orderId).subscribe({
          next: (res) => {
            if (res.success) this.order = res.data;
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
          }
        });
      }
    });
  }
}
