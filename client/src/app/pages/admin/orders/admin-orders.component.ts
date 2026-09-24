import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { Order, OrderStatus, PaymentStatus } from '../../../core/models/order.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="container-fluid px-lg-5 py-4">
      <div class="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 class="fw-bold text-navy mb-0">Master Orders & Requisition Management</h2>
          <small class="text-muted">Inspect institutional purchase orders, dispatch status, and billing audit trails</small>
        </div>
      </div>

      <!-- Filters Toolbar -->
      <div class="card scientific-card border p-3 mb-4">
        <div class="row g-2 align-items-center">
          <div class="col-12 col-md-4">
            <select class="form-select form-select-sm" [(ngModel)]="selectedOrderStatus" (change)="loadOrders()">
              <option value="">All Order Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div class="col-12 col-md-4">
            <select class="form-select form-select-sm" [(ngModel)]="selectedPaymentStatus" (change)="loadOrders()">
              <option value="">All Payment Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
          <div class="col-12 col-md-4 text-md-end">
            <small class="text-muted">Total Found: <strong>{{ orders.length }}</strong> orders</small>
          </div>
        </div>
      </div>

      <app-loading-spinner [show]="isLoading" message="Fetching all laboratory orders..."></app-loading-spinner>

      <div *ngIf="!isLoading" class="card scientific-card border shadow-sm">
        <div class="table-responsive-custom">
          <table class="scientific-table mb-0">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer / Consignee</th>
                <th>Date</th>
                <th>Total (₹)</th>
                <th>Payment</th>
                <th>Order Status</th>
                <th class="text-end">Manage</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let ord of orders">
                <td class="fw-bold text-navy">
                  {{ ord.orderNumber }}
                  <small *ngIf="ord.transactionId" class="d-block text-muted font-monospace" style="font-size: 0.7rem;">
                    {{ ord.transactionId }}
                  </small>
                </td>
                <td>
                  <strong class="text-dark d-block">{{ ord.shippingAddress.fullName }}</strong>
                  <small class="text-muted">{{ ord.shippingAddress.city }}, {{ ord.shippingAddress.state }}</small>
                </td>
                <td class="small text-muted">{{ ord.createdAt | date:'shortDate' }}</td>
                <td class="fw-bold text-dark">₹{{ ord.totalAmount | number:'1.2-2' }}</td>
                <td>
                  <span class="badge" [ngClass]="{
                    'bg-success': ord.paymentStatus === 'Paid',
                    'bg-warning text-dark': ord.paymentStatus === 'Pending',
                    'bg-danger': ord.paymentStatus === 'Failed'
                  }">
                    {{ ord.paymentStatus }}
                  </span>
                </td>
                <td>
                  <span class="badge" [ngClass]="{
                    'bg-primary': ord.orderStatus === 'Confirmed' || ord.orderStatus === 'Processing',
                    'bg-success': ord.orderStatus === 'Delivered' || ord.orderStatus === 'Shipped',
                    'bg-secondary': ord.orderStatus === 'Pending',
                    'bg-danger': ord.orderStatus === 'Cancelled'
                  }">
                    {{ ord.orderStatus }}
                  </span>
                </td>
                <td class="text-end">
                  <button class="btn btn-sm btn-outline-primary" (click)="openStatusModal(ord)">
                    <i class="bi bi-pencil-square me-1"></i> Update
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Status Update Modal -->
    <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);" *ngIf="showModal && selectedOrder">
      <div class="modal-dialog">
        <div class="modal-content shadow border-0">
          <div class="modal-header bg-navy text-white">
            <h5 class="modal-title fw-bold">Update Order Status: {{ selectedOrder.orderNumber }}</h5>
            <button type="button" class="btn-close btn-close-white" (click)="showModal = false"></button>
          </div>
          <div class="modal-body p-4">
            <div class="mb-3">
              <label class="form-label small fw-bold">Order Fulfillment Status</label>
              <select class="form-select" [(ngModel)]="newOrderStatus">
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label small fw-bold">Payment Status</label>
              <select class="form-select" [(ngModel)]="newPaymentStatus">
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Failed">Failed</option>
              </select>
            </div>

            <!-- Items Quick Inspect -->
            <div class="border rounded p-3 bg-light small">
              <span class="fw-bold d-block mb-1 text-navy">Ordered Chemicals:</span>
              <ul class="mb-0 ps-3">
                <li *ngFor="let itm of selectedOrder.items">
                  {{ itm.productName }} ({{ itm.packingSize }}) × {{ itm.quantity }}
                </li>
              </ul>
            </div>
          </div>
          <div class="modal-footer bg-light">
            <button type="button" class="btn btn-outline-secondary" (click)="showModal = false">Cancel</button>
            <button type="button" class="btn btn-briti-primary" (click)="saveStatus()">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];
  isLoading: boolean = true;
  selectedOrderStatus: string = '';
  selectedPaymentStatus: string = '';

  showModal: boolean = false;
  selectedOrder: Order | null = null;
  newOrderStatus: OrderStatus = 'Pending';
  newPaymentStatus: PaymentStatus = 'Pending';

  constructor(
    private adminService: AdminService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading = true;
    const filter: any = {};
    if (this.selectedOrderStatus) filter.orderStatus = this.selectedOrderStatus;
    if (this.selectedPaymentStatus) filter.paymentStatus = this.selectedPaymentStatus;

    this.adminService.getOrders(filter).subscribe({
      next: (res) => {
        if (res.success) this.orders = res.data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  openStatusModal(order: Order) {
    this.selectedOrder = order;
    this.newOrderStatus = order.orderStatus;
    this.newPaymentStatus = order.paymentStatus;
    this.showModal = true;
  }

  saveStatus() {
    if (!this.selectedOrder) return;

    this.adminService.updateOrderStatus(this.selectedOrder._id, this.newOrderStatus, this.newPaymentStatus).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.success(`Order ${this.selectedOrder!.orderNumber} status updated to ${this.newOrderStatus}.`);
          this.showModal = false;
          this.loadOrders();
        }
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to update order status.');
      }
    });
  }
}
