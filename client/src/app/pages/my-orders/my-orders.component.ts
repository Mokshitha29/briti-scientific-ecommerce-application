import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../core/models/order.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="container-fluid px-lg-5 py-4">
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb scientific-breadcrumb">
          <li class="breadcrumb-item"><a routerLink="/">Home</a></li>
          <li class="breadcrumb-item active" aria-current="page">My Orders</li>
        </ol>
      </nav>

      <div class="mb-4 pb-2 border-bottom">
        <h2 class="fw-bold text-navy mb-1">Chemical Order History</h2>
        <small class="text-muted">Track status, download invoices, and inspect order requisitions</small>
      </div>

      <app-loading-spinner [show]="isLoading" message="Fetching your order history..."></app-loading-spinner>

      <app-empty-state
        *ngIf="!isLoading && orders.length === 0"
        title="No Orders Found"
        description="You have not placed any chemical orders yet. Browse our catalog to place your first requisition."
        icon="bi-box-seam"
        actionText="Browse Chemicals"
        actionLink="/products"
      ></app-empty-state>

      <div *ngIf="!isLoading && orders.length > 0" class="card scientific-card border shadow-sm">
        <div class="table-responsive-custom">
          <table class="scientific-table mb-0">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Date</th>
                <th>Items Ordered</th>
                <th>Requisition Total</th>
                <th>Payment Status</th>
                <th>Order Status</th>
                <th class="text-end">Details</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let order of orders">
                <td class="fw-bold text-navy">
                  {{ order.orderNumber }}
                </td>
                <td class="text-muted small">
                  {{ order.createdAt | date:'mediumDate' }}
                </td>
                <td>
                  <span class="fw-semibold text-dark">{{ order.items.length }} line item(s)</span>
                  <div class="small text-muted text-truncate" style="max-width: 250px;">
                    {{ order.items[0].productName }} ({{ order.items[0].packingSize }})
                    <span *ngIf="order.items.length > 1">+{{ order.items.length - 1 }} more</span>
                  </div>
                </td>
                <td class="fw-bold text-dark">
                  ₹{{ order.totalAmount | number:'1.2-2' }}
                </td>
                <td>
                  <span class="badge" [ngClass]="{
                    'bg-success': order.paymentStatus === 'Paid',
                    'bg-warning text-dark': order.paymentStatus === 'Pending',
                    'bg-danger': order.paymentStatus === 'Failed'
                  }">
                    {{ order.paymentStatus }}
                  </span>
                </td>
                <td>
                  <span class="badge" [ngClass]="{
                    'bg-primary': order.orderStatus === 'Confirmed' || order.orderStatus === 'Processing',
                    'bg-success': order.orderStatus === 'Delivered' || order.orderStatus === 'Shipped',
                    'bg-secondary': order.orderStatus === 'Pending',
                    'bg-danger': order.orderStatus === 'Cancelled'
                  }">
                    {{ order.orderStatus }}
                  </span>
                </td>
                <td class="text-end">
                  <a [routerLink]="['/my-orders', order._id]" class="btn btn-sm btn-briti-primary">
                    <i class="bi bi-file-earmark-text me-1"></i> View
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class MyOrdersComponent implements OnInit {
  orders: Order[] = [];
  isLoading: boolean = true;

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.orderService.getMyOrders().subscribe({
      next: (res) => {
        if (res.success) this.orders = res.data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
